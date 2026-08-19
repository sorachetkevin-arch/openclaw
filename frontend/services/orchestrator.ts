import { AgentDefinition, AgentState, Job } from '../types';
import { AGENT_DEFINITIONS } from '../agents/definitions';
import { runAgentTask } from './geminiService';

export function initialAgentStates(job: Job, definitions: AgentDefinition[] = AGENT_DEFINITIONS): AgentState[] {
  return definitions.map((def) => ({
    id: def.id,
    name: def.name,
    role: def.role,
    description: def.description,
    iconName: def.iconName,
    colorClass: def.colorClass,
    status: def.isApplicable(job) ? 'idle' : 'skipped',
    output: null,
    error: null,
    startTime: null,
    endTime: null,
  }));
}

/** Groups agents into sequential stages so every agent's dependencies have already run by the time its stage starts. */
function buildStages(definitions: AgentDefinition[]): AgentDefinition[][] {
  const remaining = new Map(definitions.map((d) => [d.id, d]));
  const done = new Set<string>();
  const stages: AgentDefinition[][] = [];

  while (remaining.size > 0) {
    const stage = [...remaining.values()].filter((d) => d.dependsOn.every((dep) => done.has(dep)));
    if (stage.length === 0) {
      // Dependency cycle or missing dependency — bail out with whatever is left as a final stage.
      stages.push([...remaining.values()]);
      break;
    }
    stages.push(stage);
    stage.forEach((d) => {
      remaining.delete(d.id);
      done.add(d.id);
    });
  }

  return stages;
}

/**
 * Runs the sub-agent pipeline for a job, stage by stage: agents within a stage run in
 * parallel, and each stage only starts once every agent it depends on has finished, so
 * dependent agents receive their upstream outputs as previousContext.
 */
export async function runOrchestration(
  job: Job,
  onUpdate: (agentId: string, update: Partial<AgentState>) => void,
  definitions: AgentDefinition[] = AGENT_DEFINITIONS
): Promise<void> {
  const outputs = new Map<string, string>();
  const stages = buildStages(definitions);

  for (const stage of stages) {
    await Promise.all(
      stage.map(async (def) => {
        if (!def.isApplicable(job)) {
          onUpdate(def.id, { status: 'skipped' });
          return;
        }

        const startTime = Date.now();
        onUpdate(def.id, { status: 'loading', startTime, error: null });

        try {
          const previousContext = def.dependsOn
            .map((depId) => outputs.get(depId))
            .filter((v): v is string => !!v)
            .join('\n\n---\n\n') || undefined;

          const output = await runAgentTask(def.systemInstruction, def.buildInput(job), previousContext);
          outputs.set(def.id, output);
          onUpdate(def.id, { status: 'success', output, endTime: Date.now() });
        } catch (error: any) {
          onUpdate(def.id, { status: 'error', error: error?.message || 'เกิดข้อผิดพลาด', endTime: Date.now() });
        }
      })
    );
  }
}
