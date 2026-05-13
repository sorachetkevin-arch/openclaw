
// CRM Pipeline Kanban View — Drag & drop lead status
const { useState, useRef, useEffect } = React;

const PIPELINE_STAGES = [
  { id: 'NEW',           label: 'New',           color: '#6366F1', bg: '#EEF2FF', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> },
  { id: 'CONTACTED',     label: 'Contacted',     color: '#06B6D4', bg: '#ECFEFF', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> },
  { id: 'QUALIFIED',     label: 'Qualified',     color: '#8B5CF6', bg: '#F5F3FF', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: '#F59E0B', bg: '#FFFBEB', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> },
  { id: 'FOLLOW_UP',     label: 'Follow Up',     color: '#F97316', bg: '#FFF7ED', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg> },
  { id: 'WON',           label: 'Won',           color: '#10B981', bg: '#ECFDF5', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg> },
  { id: 'LOST',          label: 'Lost',          color: '#EF4444', bg: '#FEF2F2', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg> },
];

const PIPELINE_LEADS = [
  { id:1,  name:'สมชาย ใจดี',   company:'ABC Corp',  source:'Facebook',   score:95, budget:'฿50K',  status:'NEW',           assignee:'John D.',  days:1 },
  { id:2,  name:'มานะ รักดี',   company:'JKL Pvt',   source:'Facebook',   score:80, budget:'฿35K',  status:'NEW',           assignee:'Sara K.',  days:3 },
  { id:3,  name:'Anon Lee',     company:'MNO SG',    source:'Organic',    score:62, budget:'฿15K',  status:'NEW',           assignee:'Mike T.',  days:2 },
  { id:4,  name:'นภา สุขใส',    company:'VWX Co',    source:'Google',     score:55, budget:'฿45K',  status:'NEW',           assignee:'Mike T.',  days:1 },
  { id:5,  name:'Natthawut K.', company:'XYZ Ltd',   source:'Google',     score:88, budget:'฿120K', status:'CONTACTED',     assignee:'Sara K.',  days:5 },
  { id:6,  name:'Anya Petrov',  company:'YZA Ltd',   source:'Facebook',   score:70, budget:'฿60K',  status:'CONTACTED',     assignee:'John D.',  days:2 },
  { id:7,  name:'วิภา แสนดี',   company:'DEF Co',    source:'LINE Ads',   score:84, budget:'฿80K',  status:'QUALIFIED',     assignee:'Mike T.',  days:8 },
  { id:8,  name:'Priya Sharma', company:'GHI Inc',   source:'Referral',   score:82, budget:'฿200K', status:'QUALIFIED',     assignee:'John D.',  days:4 },
  { id:9,  name:'Ben Chang',    company:'BCo',       source:'Email',      score:66, budget:'฿90K',  status:'QUALIFIED',     assignee:'Amy R.',   days:6 },
  { id:10, name:'Ali Hassan',   company:'AH Ltd',    source:'Walk-in',    score:58, budget:'฿25K',  status:'PROPOSAL_SENT', assignee:'Sara K.',  days:10 },
  { id:11, name:'Liu Wei',      company:'LW Corp',   source:'Google',     score:75, budget:'฿110K', status:'PROPOSAL_SENT', assignee:'John D.',  days:7 },
  { id:12, name:'Mei Sakura',   company:'MeiCo',     source:'Referral',   score:79, budget:'฿75K',  status:'FOLLOW_UP',     assignee:'Mike T.',  days:12 },
  { id:13, name:'กมลา จริยา',   company:'PQR Ltd',   source:'Email',      score:75, budget:'฿90K',  status:'WON',           assignee:'John D.',  days:20 },
  { id:14, name:'Tom Wilson',   company:'STU Corp',  source:'Walk-in',    score:30, budget:'฿10K',  status:'LOST',          assignee:'Sara K.',  days:15 },
];

function ScoreChip({ score }) {
  const color = score>=80?'#EF4444':score>=50?'#F59E0B':'#94A3B8';
  const bg    = score>=80?'#FEF2F2':score>=50?'#FFFBEB':'#F1F5F9';
  const d = score>=80
    ? 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z'
    : score>=50
    ? 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z'
    : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13h1v6h-1zm0 8h1v2h-1z';
  return (
    <span style={{ background:bg,color,borderRadius:5,padding:'2px 6px',fontSize:10,fontWeight:700,display:'inline-flex',alignItems:'center',gap:3 }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill={color}><path d={d}/></svg>
      {score}
    </span>
  );
}

function KanbanCard({ lead, onDragStart, onClick }) {
  const stage = PIPELINE_STAGES.find(s => s.id === lead.status);
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead)}
      onClick={() => onClick(lead)}
      style={{
        background:'#fff', borderRadius:10, padding:'12px 14px',
        border:'1px solid #E2E8F0', cursor:'grab',
        boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
        transition:'box-shadow 0.15s, transform 0.1s',
        userSelect:'none',
      }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-1px)';}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)';e.currentTarget.style.transform='none';}}
    >
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
        <div style={{ fontWeight:600,fontSize:13,color:'#0F172A',lineHeight:1.3 }}>{lead.name}</div>
        <ScoreChip score={lead.score}/>
      </div>
      <div style={{ fontSize:11,color:'#64748B',marginBottom:6 }}>{lead.company}</div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:11,color:'#94A3B8',background:'#F8FAFC',borderRadius:5,padding:'1px 6px',border:'1px solid #E2E8F0' }}>{lead.source}</span>
        <span style={{ fontSize:12,fontWeight:700,color:'#10B981' }}>{lead.budget}</span>
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,paddingTop:8,borderTop:'1px solid #F1F5F9' }}>
        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:`hsl(${lead.assignee.charCodeAt(0)*40%360},55%,65%)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:9,fontWeight:700 }}>
            {lead.assignee.charAt(0)}
          </div>
          <span style={{ fontSize:11,color:'#64748B' }}>{lead.assignee}</span>
        </div>
        <span style={{ fontSize:10,color:'#94A3B8' }}>{lead.days}d ago</span>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, leads, onDrop, onDragOver, onDragStart, onCardClick }) {
  const totalValue = leads.reduce((s,l) => {
    const v = parseInt(l.budget?.replace(/[฿K,]/g,'')) || 0;
    const mult = l.budget?.includes('K') ? 1000 : 1;
    return s + v * mult;
  }, 0);

  return (
    <div
      onDrop={e=>{e.preventDefault();onDrop(stage.id);}}
      onDragOver={e=>{e.preventDefault();e.currentTarget.style.background='#F0F9FF';}}
      onDragLeave={e=>{e.currentTarget.style.background='#F8FAFC';}}
      style={{
        minWidth:220, flex:'0 0 220px', background:'#F8FAFC',
        borderRadius:12, padding:'12px 10px', display:'flex', flexDirection:'column', gap:8,
        border:'2px dashed transparent', transition:'all 0.15s',
      }}
    >
      {/* Column header */}
      <div style={{ padding:'0 2px 8px',borderBottom:'2px solid '+stage.color }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
            <span>{stage.icon}</span>
            <span style={{ fontWeight:700,fontSize:13,color:'#0F172A' }}>{stage.label}</span>
          </div>
          <span style={{ background:stage.bg,color:stage.color,borderRadius:12,fontSize:11,fontWeight:700,padding:'1px 7px' }}>{leads.length}</span>
        </div>
        <div style={{ fontSize:11,color:'#94A3B8' }}>
          ฿{totalValue >= 1000000 ? (totalValue/1000000).toFixed(1)+'M' : totalValue >= 1000 ? (totalValue/1000).toFixed(0)+'K' : totalValue}
        </div>
      </div>

      {/* Cards */}
      {leads.map(lead => (
        <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} onClick={onCardClick}/>
      ))}

      {leads.length === 0 && (
        <div style={{ padding:'24px 12px',textAlign:'center',color:'#CBD5E1',fontSize:12 }}>
          Drop leads here
        </div>
      )}
    </div>
  );
}

function LeadDetailPanel({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  const stage = PIPELINE_STAGES.find(s => s.id === lead.status);
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'flex-end' }} onClick={onClose}>
      <div style={{ background:'#fff',width:360,height:'100%',overflowY:'auto',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',display:'flex',flexDirection:'column' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 20px 16px',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700,fontSize:15,color:'#0F172A' }}>{lead.name}</div>
            <div style={{ fontSize:12,color:'#64748B' }}>{lead.company}</div>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#64748B' }}>✕</button>
        </div>
        <div style={{ padding:20,display:'flex',flexDirection:'column',gap:16 }}>
          <div style={{ background:stage.bg,borderRadius:10,padding:14,border:`1px solid ${stage.color}30` }}>
            <div style={{ fontSize:11,color:stage.color,fontWeight:700,marginBottom:4 }}>Current Stage</div>
            <div style={{ fontWeight:700,color:stage.color,fontSize:14 }}>{stage.icon} {stage.label}</div>
          </div>
          {[['Source',lead.source],['Budget',lead.budget],['Assigned',lead.assignee],['Score',`${lead.score}/100`],['In pipeline',`${lead.days} days`]].map(([k,v])=>(
            <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:12,borderBottom:'1px solid #F8FAFC' }}>
              <span style={{ fontSize:12,color:'#64748B' }}>{k}</span>
              <span style={{ fontSize:13,fontWeight:600,color:'#0F172A' }}>{v}</span>
            </div>
          ))}
          <div>
            <div style={{ fontSize:12,fontWeight:600,color:'#64748B',marginBottom:8 }}>Move to Stage</div>
            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              {PIPELINE_STAGES.filter(s=>s.id!==lead.status).map(s=>(
                <button key={s.id} onClick={()=>onStatusChange(lead.id,s.id)} style={{
                  background:s.bg,color:s.color,border:`1px solid ${s.color}30`,borderRadius:8,
                  padding:'8px 12px',fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left',
                }}>→ {s.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);

  const fmt = l => {
    const bud = l.budget || 0;
    const short = bud >= 1000 ? `฿${Math.round(bud/1000)}K` : `฿${bud}`;
    const daysAgo = l.updatedAt ? Math.max(0, Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / 86400000)) : 0;
    return {
      id: l.id, name: l.name, company: l.company, source: l.source,
      score: l.score, status: l.status, assignee: l.assignee || '—',
      budget: short, days: daysAgo, _rawBudget: bud,
    };
  };

  useEffect(() => {
    window.api.leads.list()
      .then(rows => setLeads(rows.map(fmt)))
      .catch(err => setErrMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  const persistStatus = (leadId, newStatus) => {
    window.api.leads.update(leadId, { status: newStatus }).catch(err => setErrMsg(err.message));
  };

  const handleDrop = (stageId) => {
    if (!dragging) return;
    setLeads(ls => ls.map(l => l.id === dragging.id ? { ...l, status: stageId } : l));
    persistStatus(dragging.id, stageId);
    setDragging(null);
  };

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(ls => ls.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    persistStatus(leadId, newStatus);
  };

  const totalValue = leads.filter(l=>l.status!=='LOST').reduce((s,l) => s + (l._rawBudget || 0), 0);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20,height:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>Pipeline</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>
            {loading ? 'Loading…' : `${leads.length} leads · Pipeline value ฿${(totalValue/1000000).toFixed(2)}M · Drag cards to update stage`}{errMsg && ` · ${errMsg}`}
          </p>
        </div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          {PIPELINE_STAGES.map(s=>(
            <div key={s.id} style={{ background:s.bg,color:s.color,borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700 }}>
              {s.icon} {leads.filter(l=>l.status===s.id).length}
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div style={{ display:'flex',gap:12,overflowX:'auto',paddingBottom:16,flex:1 }}>
        {PIPELINE_STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter(l=>l.status===stage.id)}
            onDragStart={setDragging}
            onDrop={handleDrop}
            onDragOver={()=>{}}
            onCardClick={setSelected}
          />
        ))}
      </div>

      {selected && (
        <LeadDetailPanel
          lead={selected}
          onClose={()=>setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

Object.assign(window, { PipelineView });
