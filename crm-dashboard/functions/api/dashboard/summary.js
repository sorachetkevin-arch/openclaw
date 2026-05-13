import { json, requireAuth, serializeLead } from '../_lib.js';

export const onRequestGet = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;

  const counts = await ctx.env.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) AS new_count,
      SUM(CASE WHEN status = 'CONTACTED' THEN 1 ELSE 0 END) AS contacted,
      SUM(CASE WHEN status = 'QUALIFIED' THEN 1 ELSE 0 END) AS qualified,
      SUM(CASE WHEN status = 'PROPOSAL_SENT' THEN 1 ELSE 0 END) AS proposal,
      SUM(CASE WHEN status = 'FOLLOW_UP' THEN 1 ELSE 0 END) AS follow_up,
      SUM(CASE WHEN status = 'WON' THEN 1 ELSE 0 END) AS won,
      SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END) AS lost,
      SUM(CASE WHEN score >= 80 THEN 1 ELSE 0 END) AS hot,
      SUM(CASE WHEN status = 'WON' THEN budget ELSE 0 END) AS revenue
    FROM leads
  `).first();

  const hot = await ctx.env.DB.prepare(`
    SELECT l.*, u.name AS assignee_name FROM leads l
    LEFT JOIN users u ON u.id = l.assignee_id
    WHERE l.score >= 80 AND l.status NOT IN ('WON','LOST')
    ORDER BY l.score DESC LIMIT 5
  `).all();

  const followUps = await ctx.env.DB.prepare(`
    SELECT l.*, u.name AS assignee_name FROM leads l
    LEFT JOIN users u ON u.id = l.assignee_id
    WHERE l.next_follow_up IS NOT NULL AND l.status NOT IN ('WON','LOST')
    ORDER BY l.next_follow_up ASC LIMIT 8
  `).all();

  const bySource = await ctx.env.DB.prepare(`
    SELECT source, COUNT(*) AS n FROM leads WHERE source IS NOT NULL
    GROUP BY source ORDER BY n DESC LIMIT 8
  `).all();

  return json({
    counts: {
      total: counts.total || 0,
      new: counts.new_count || 0,
      contacted: counts.contacted || 0,
      qualified: counts.qualified || 0,
      proposal: counts.proposal || 0,
      followUp: counts.follow_up || 0,
      won: counts.won || 0,
      lost: counts.lost || 0,
      hot: counts.hot || 0,
      revenue: counts.revenue || 0,
    },
    hotLeads: hot.results.map(serializeLead),
    followUps: followUps.results.map(serializeLead),
    bySource: bySource.results.map((r) => ({ source: r.source, count: r.n })),
  });
};
