
// CRM Leads Management View — Full CRUD table + modal
const { useState, useRef, useEffect } = React;

const STATUS_CONFIG = {
  NEW:           { label: 'New',           color: '#6366F1', bg: '#EEF2FF' },
  CONTACTED:     { label: 'Contacted',     color: '#06B6D4', bg: '#ECFEFF' },
  QUALIFIED:     { label: 'Qualified',     color: '#8B5CF6', bg: '#F5F3FF' },
  PROPOSAL_SENT: { label: 'Proposal Sent', color: '#F59E0B', bg: '#FFFBEB' },
  FOLLOW_UP:     { label: 'Follow Up',     color: '#F97316', bg: '#FFF7ED' },
  WON:           { label: 'Won',           color: '#10B981', bg: '#ECFDF5' },
  LOST:          { label: 'Lost',          color: '#EF4444', bg: '#FEF2F2' },
};

const SCORE_CONFIG = s => s >= 80
  ? { label: 'HOT',  color: '#EF4444', bg: '#FEF2F2' }
  : s >= 50
  ? { label: 'WARM', color: '#F59E0B', bg: '#FFFBEB' }
  : { label: 'COLD', color: '#94A3B8', bg: '#F1F5F9' };

const SAMPLE_LEADS = [
  { id:1, name:'สมชาย ใจดี',     phone:'081-234-5678', email:'somchai@email.com', company:'ABC Corp',    source:'Facebook Ads', status:'NEW',           score:95, assignee:'John D.', budget:'฿50,000', tags:['VIP','Hot'],     lastContact:'12 May',  nextFollowUp:'13 May',  lineId:'U123' },
  { id:2, name:'Natthawut K.',   phone:'082-345-6789', email:'natthawut@biz.co', company:'XYZ Ltd',     source:'Google Ads',   status:'QUALIFIED',     score:88, assignee:'Sara K.', budget:'฿120,000',tags:['Enterprise'],   lastContact:'11 May',  nextFollowUp:'14 May',  lineId:'U456' },
  { id:3, name:'วิภา แสนดี',     phone:'083-456-7890', email:'vipa@corp.th',     company:'DEF Co',      source:'LINE Ads',     status:'PROPOSAL_SENT', score:84, assignee:'Mike T.', budget:'฿80,000', tags:['Urgent'],        lastContact:'10 May',  nextFollowUp:'12 May',  lineId:'U789' },
  { id:4, name:'Priya Sharma',   phone:'084-567-8901', email:'priya@firm.in',    company:'GHI Inc',     source:'Referral',     status:'CONTACTED',     score:82, assignee:'John D.', budget:'฿200,000',tags:['High Value'],   lastContact:'12 May',  nextFollowUp:'15 May',  lineId:'' },
  { id:5, name:'มานะ รักดี',     phone:'085-678-9012', email:'mana@web.th',      company:'JKL Pvt',     source:'Facebook Ads', status:'FOLLOW_UP',     score:80, assignee:'Sara K.', budget:'฿35,000', tags:['Follow-up'],    lastContact:'09 May',  nextFollowUp:'12 May',  lineId:'Uabc' },
  { id:6, name:'Anon Lee',       phone:'086-789-0123', email:'anon@lee.sg',      company:'MNO SG',      source:'Organic',      status:'NEW',           score:62, assignee:'Mike T.', budget:'฿15,000', tags:[],               lastContact:'08 May',  nextFollowUp:'13 May',  lineId:'' },
  { id:7, name:'กมลา จริยา',    phone:'087-890-1234', email:'kamala@org.th',    company:'PQR Ltd',     source:'Email Campaign',status:'WON',          score:75, assignee:'John D.', budget:'฿90,000', tags:['Won'],          lastContact:'07 May',  nextFollowUp:'—',       lineId:'Udef' },
  { id:8, name:'Tom Wilson',     phone:'088-901-2345', email:'tom@corp.com',     company:'STU Corp',    source:'Walk-in',      status:'LOST',          score:30, assignee:'Sara K.', budget:'฿10,000', tags:['Lost'],         lastContact:'05 May',  nextFollowUp:'—',       lineId:'' },
  { id:9, name:'นภา สุขใส',      phone:'089-012-3456', email:'napa@happy.th',    company:'VWX Co',      source:'Google Ads',   status:'NEW',           score:55, assignee:'Mike T.', budget:'฿45,000', tags:['Warm'],         lastContact:'11 May',  nextFollowUp:'14 May',  lineId:'Ughi' },
  { id:10,name:'Anya Petrov',    phone:'090-123-4567', email:'anya@russ.ru',     company:'YZA Ltd',     source:'Facebook Ads', status:'CONTACTED',     score:70, assignee:'John D.', budget:'฿60,000', tags:['International'],lastContact:'10 May',  nextFollowUp:'16 May',  lineId:'' },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, borderRadius: 6,
      padding: '2px 8px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

function ScoreBadge({ score }) {
  const cfg = SCORE_CONFIG(score);
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, borderRadius: 6,
      padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>{cfg.label} {score}</span>
  );
}

function LeadModal({ lead, onClose, onSave, users = [] }) {
  const [form, setForm] = useState(lead || {
    name:'', phone:'', email:'', company:'', source:'', status:'NEW',
    budget:'', interest:'', assigneeId:'', tags:'', notes:'', lineId:'',
    campaign:'', medium:'', utmSource:'', utmCampaign:'',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isNew = !lead?.id;

  // Lead score preview
  const calcScore = () => {
    let s = 0;
    if (form.phone) s += 20;
    if (form.lineId) s += 20;
    if (form.budget) s += 15;
    if (['Facebook Ads','Google Ads','LINE Ads'].includes(form.source)) s += 15;
    if (form.interest === 'high') s += 10;
    if (form.notes?.toLowerCase().includes('ติดต่อ') || form.notes?.toLowerCase().includes('contact')) s += 20;
    return Math.min(s, 100);
  };
  const score = calcScore();
  const scoreCfg = SCORE_CONFIG(score);

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid #E2E8F0', fontSize: 13, color: '#0F172A',
    background: '#FAFAFA', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              {isNew ? '+ New Lead' : 'Edit Lead'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Fill in lead details below</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Score</div>
              <span style={{ background: scoreCfg.bg, color: scoreCfg.color, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>
                {scoreCfg.label} {score}
              </span>
            </div>
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748B' }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['name','Name *','text'],['phone','Phone','tel'],['email','Email','email'],['company','Company','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input type={t} value={form[k]||''} onChange={e=>set(k,e.target.value)} style={inputStyle} placeholder={l}/>
                </div>
              ))}
            </div>
          </div>

          {/* Line + Source */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source & LINE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Source</label>
                <select value={form.source||''} onChange={e=>set('source',e.target.value)} style={inputStyle}>
                  <option value="">Select source</option>
                  {['Facebook Ads','Google Ads','LINE Ads','Organic','Referral','Email Campaign','Walk-in','Other'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Campaign</label>
                <input value={form.campaign||''} onChange={e=>set('campaign',e.target.value)} style={inputStyle} placeholder="Campaign name"/>
              </div>
              <div>
                <label style={labelStyle}>LINE User ID</label>
                <input value={form.lineId||''} onChange={e=>set('lineId',e.target.value)} style={inputStyle} placeholder="Uxxxxxxxxxx"/>
              </div>
            </div>
          </div>

          {/* UTM */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>UTM Tracking</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['utmSource','utm_source'],['utmMedium','utm_medium'],['utmCampaign','utm_campaign']].map(([k,l])=>(
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input value={form[k]||''} onChange={e=>set(k,e.target.value)} style={inputStyle} placeholder={l}/>
                </div>
              ))}
            </div>
          </div>

          {/* Deal info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal & Assignment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status||'NEW'} onChange={e=>set('status',e.target.value)} style={inputStyle}>
                  {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget</label>
                <input value={form.budget||''} onChange={e=>set('budget',e.target.value)} style={inputStyle} placeholder="฿ amount"/>
              </div>
              <div>
                <label style={labelStyle}>Interest</label>
                <select value={form.interest||''} onChange={e=>set('interest',e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Assigned To</label>
                <select value={form.assigneeId||''} onChange={e=>set('assigneeId',e.target.value)} style={inputStyle}>
                  <option value="">Assign to...</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes||''} onChange={e=>set('notes',e.target.value)} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Add notes about this lead..."/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ background: '#6366F1', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'white' }}>
            {isNew ? 'Create Lead' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ lead, onClose, onConfirm }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%',boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:40,textAlign:'center',marginBottom:12 }}>⚠️</div>
        <h3 style={{ textAlign:'center',fontSize:16,fontWeight:700,color:'#0F172A',margin:'0 0 8px' }}>Delete Lead?</h3>
        <p style={{ textAlign:'center',fontSize:13,color:'#64748B',margin:'0 0 24px' }}>
          Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 20px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
          <button onClick={()=>{onConfirm(lead.id);onClose();}} style={{ background:'#EF4444',border:'none',borderRadius:8,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',color:'white' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── CSV Import Modal ──────────────────────────────────────────────────────
function CSVImportModal({ rows, onClose, onImport }) {
  const [selected, setSelected] = useState(() => rows.map((_, i) => i));
  const [step, setStep] = useState('preview'); // 'preview' | 'done'
  const allChecked = selected.length === rows.length;

  const toggleAll = () => setSelected(allChecked ? [] : rows.map((_, i) => i));
  const toggleRow = i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);

  const doImport = () => {
    const toAdd = selected.map(i => ({
      ...rows[i],
      id: Date.now() + i,
      status: rows[i].status || 'NEW',
      score: (() => {
        let s = 0;
        if (rows[i].phone) s += 20;
        if (rows[i].lineId) s += 20;
        if (rows[i].budget) s += 15;
        if (['Facebook Ads','Google Ads','LINE Ads'].includes(rows[i].source)) s += 15;
        return Math.min(s, 100);
      })(),
      tags: [],
    }));
    onImport(toAdd);
    setStep('done');
  };

  const cols = ['name','phone','email','company','source','budget','status'];

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.48)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,width:'100%',maxWidth:780,maxHeight:'88vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'20px 24px',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:'#0F172A' }}>📂 Import CSV</h3>
            <p style={{ margin:'2px 0 0',fontSize:12,color:'#94A3B8' }}>
              {step==='preview' ? `${rows.length} rows detected · select rows to import` : `✅ Import complete`}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#64748B' }}>✕</button>
        </div>

        {step === 'done' ? (
          <div style={{ padding:48,textAlign:'center' }}>
            <div style={{ fontSize:56,marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:18,fontWeight:700,color:'#0F172A',marginBottom:8 }}>
              {selected.length} leads imported!
            </div>
            <div style={{ fontSize:13,color:'#64748B',marginBottom:28 }}>
              Lead scores were calculated automatically.
            </div>
            <button onClick={onClose} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'10px 28px',fontSize:14,fontWeight:600,cursor:'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            {/* Info bar */}
            <div style={{ padding:'10px 24px',background:'#F0F9FF',borderBottom:'1px solid #BAE6FD',display:'flex',alignItems:'center',gap:12 }}>
              <span style={{ fontSize:12,color:'#0369A1' }}>
                💡 Columns mapped: <strong>name, phone, email, company, source, budget, status</strong>
              </span>
              <a href="data:text/csv;charset=utf-8,name,phone,email,company,source,budget,status%0AสมชายA,081-000-0001,a@test.com,CorpA,Facebook Ads,50000,NEW" download="crm-template.csv"
                style={{ marginLeft:'auto',fontSize:11,color:'#0369A1',fontWeight:600,textDecoration:'underline',cursor:'pointer' }}>
                ↓ Download Template
              </a>
            </div>

            {/* Table */}
            <div style={{ padding:'0 24px 24px',overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',marginTop:16,fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
                    <th style={{ padding:'8px 10px',textAlign:'center',width:40 }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor:'pointer' }}/>
                    </th>
                    <th style={{ padding:'8px 6px',textAlign:'left',fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase' }}>#</th>
                    {cols.map(c=>(
                      <th key={c} style={{ padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap' }}>{c}</th>
                    ))}
                    <th style={{ padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:700,color:'#64748B',textTransform:'uppercase' }}>Score Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const checked = selected.includes(i);
                    let previewScore = 0;
                    if (row.phone) previewScore += 20;
                    if (row.lineId) previewScore += 20;
                    if (row.budget) previewScore += 15;
                    if (['Facebook Ads','Google Ads','LINE Ads'].includes(row.source)) previewScore += 15;
                    const sc = previewScore >= 80 ? ['#FEF2F2','#EF4444','HOT'] : previewScore >= 50 ? ['#FFFBEB','#F59E0B','WARM'] : ['#F1F5F9','#94A3B8','COLD'];
                    return (
                      <tr key={i} onClick={()=>toggleRow(i)} style={{ borderBottom:'1px solid #F8FAFC',background:checked?'#FAFFFE':'#fff',cursor:'pointer',transition:'background 0.1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background=checked?'#F0FDF4':'#F8FAFC'}
                        onMouseLeave={e=>e.currentTarget.style.background=checked?'#FAFFFE':'#fff'}
                      >
                        <td style={{ padding:'9px 10px',textAlign:'center' }}>
                          <input type="checkbox" checked={checked} onChange={()=>toggleRow(i)} onClick={e=>e.stopPropagation()} style={{ cursor:'pointer' }}/>
                        </td>
                        <td style={{ padding:'9px 6px',color:'#94A3B8' }}>{i+1}</td>
                        {cols.map(c=>(
                          <td key={c} style={{ padding:'9px 10px',color:'#374151',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                            {row[c] || <span style={{ color:'#CBD5E1' }}>—</span>}
                          </td>
                        ))}
                        <td style={{ padding:'9px 10px' }}>
                          <span style={{ background:sc[0],color:sc[1],borderRadius:6,padding:'2px 7px',fontSize:10,fontWeight:700 }}>{sc[2]} {previewScore}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding:'14px 24px',borderTop:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontSize:12,color:'#64748B' }}>{selected.length} of {rows.length} rows selected</span>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
                <button onClick={doImport} disabled={selected.length===0} style={{ background:selected.length?'#6366F1':'#C7D2FE',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:selected.length?'pointer':'not-allowed',color:'white' }}>
                  Import {selected.length} Leads
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g,'_'));
  const MAP = { name:'name',phone:'phone',email:'email',company:'company',source:'source',budget:'budget',status:'status',line_id:'lineId',lineid:'lineId',assignee:'assignee',campaign:'campaign' };
  return lines.slice(1).filter(l=>l.trim()).map(line => {
    const vals = line.split(',');
    const row = {};
    headers.forEach((h, i) => { const key = MAP[h]||h; row[key] = vals[i]?.trim()||''; });
    return row;
  });
}

// ── LeadsView ────────────────────────────────────────────────────────────
function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterScore, setFilterScore] = useState('ALL');
  const [modalLead, setModalLead] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [csvRows, setCsvRows] = useState(null);
  const fileInputRef = useRef(null);

  const fmt = l => ({
    ...l,
    budget: typeof l.budget === 'number' ? `฿${l.budget.toLocaleString()}` : (l.budget || ''),
    assignee: l.assignee || '—',
    assigneeId: l.assigneeId || '',
    nextFollowUp: l.nextFollowUp || '—',
  });

  useEffect(() => {
    Promise.all([
      window.api.leads.list(),
      window.api.users.list(),
    ]).then(([rows, us]) => {
      setLeads(rows.map(fmt));
      setUsers(us.filter(u => u.status === 'active'));
    }).catch(err => setErrMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result);
      if (rows.length) setCsvRows(rows);
      else alert('ไม่พบข้อมูลใน CSV หรือรูปแบบไม่ถูกต้อง');
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const filtered = leads
    .filter(l => filterStatus === 'ALL' || l.status === filterStatus)
    .filter(l => filterScore === 'ALL'
      ? true
      : filterScore === 'HOT' ? l.score >= 80
      : filterScore === 'WARM' ? l.score >= 50 && l.score < 80
      : l.score < 50)
    .filter(l => !search || [l.name, l.email, l.company, l.source].join(' ').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'score') return (a.score - b.score) * dir;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      return 0;
    });

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const thStyle = (col) => ({
    padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
    whiteSpace: 'nowrap', background: sortBy === col ? '#F8FAFC' : 'transparent',
    userSelect: 'none',
  });

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>Leads</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>{loading ? 'Loading…' : `${leads.length} total leads · ${filtered.length} showing`}{errMsg && ` · ${errMsg}`}</p>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display:'none' }} onChange={handleFileChange}/>
          <button onClick={()=>fileInputRef.current?.click()} style={{ background:'#F1F5F9',border:'1px solid #E2E8F0',borderRadius:8,padding:'8px 12px',fontSize:13,cursor:'pointer',color:'#374151',display:'flex',alignItems:'center',gap:6 }}>
            <span>↑</span> Import CSV
          </button>
          <button onClick={()=>setShowNew(true)} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer' }}>+ New Lead</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
        <div style={{ position:'relative',flex:'1',minWidth:200 }}>
          <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94A3B8',fontSize:14 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads..." style={{ width:'100%',padding:'8px 10px 8px 32px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,outline:'none',boxSizing:'border-box' }}/>
        </div>
        <div style={{ display:'flex',gap:4,background:'#F1F5F9',borderRadius:8,padding:4 }}>
          {['ALL',...Object.keys(STATUS_CONFIG)].map(s => (
            <button key={s} onClick={()=>setFilterStatus(s)} style={{
              background: filterStatus===s ? '#fff' : 'transparent',
              border: 'none', borderRadius:6, padding:'4px 8px', fontSize:11,
              fontWeight: filterStatus===s ? 600 : 400,
              color: filterStatus===s ? '#0F172A' : '#64748B',
              cursor:'pointer', boxShadow: filterStatus===s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{s==='ALL'?'All':STATUS_CONFIG[s]?.label}</button>
          ))}
        </div>
        <div style={{ display:'flex',gap:4,background:'#F1F5F9',borderRadius:8,padding:4 }}>
          {['ALL','HOT','WARM','COLD'].map(s=>(
            <button key={s} onClick={()=>setFilterScore(s)} style={{
              background:filterScore===s?'#fff':'transparent',border:'none',borderRadius:6,
              padding:'4px 8px',fontSize:11,fontWeight:filterScore===s?600:400,
              color:s==='HOT'&&filterScore===s?'#EF4444':s==='WARM'&&filterScore===s?'#F59E0B':filterScore===s?'#0F172A':'#64748B',
              cursor:'pointer', boxShadow:filterScore===s?'0 1px 3px rgba(0,0,0,0.08)':'none',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff',borderRadius:12,border:'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
                <th style={thStyle('name')} onClick={()=>handleSort('name')}>Name {sortBy==='name'?(sortDir==='asc'?'↑':'↓'):''}</th>
                <th style={thStyle()}>Contact</th>
                <th style={thStyle()}>Company</th>
                <th style={thStyle()}>Source</th>
                <th style={thStyle()}>Status</th>
                <th style={thStyle('score')} onClick={()=>handleSort('score')}>Score {sortBy==='score'?(sortDir==='asc'?'↑':'↓'):''}</th>
                <th style={thStyle()}>Assignee</th>
                <th style={thStyle()}>Budget</th>
                <th style={thStyle()}>Follow-up</th>
                <th style={thStyle()}>LINE</th>
                <th style={thStyle()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id} style={{
                  borderBottom:'1px solid #F8FAFC',
                  background: i%2===0?'#fff':'#FAFAFA',
                  transition:'background 0.1s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#F1F5F9'}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fff':'#FAFAFA'}
                >
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <div style={{ width:30,height:30,borderRadius:'50%',background:`hsl(${lead.name.charCodeAt(0)*37%360},60%,65%)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:11,flexShrink:0 }}>
                        {lead.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight:600,fontSize:13,color:'#0F172A' }}>{lead.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ fontSize:12,color:'#64748B' }}>{lead.phone}</div>
                    <div style={{ fontSize:11,color:'#94A3B8' }}>{lead.email}</div>
                  </td>
                  <td style={{ padding:'11px 12px',fontSize:13,color:'#374151' }}>{lead.company}</td>
                  <td style={{ padding:'11px 12px' }}>
                    <span style={{ fontSize:12,color:'#64748B',background:'#F8FAFC',borderRadius:6,padding:'2px 8px',border:'1px solid #E2E8F0' }}>{lead.source}</span>
                  </td>
                  <td style={{ padding:'11px 12px' }}><StatusBadge status={lead.status}/></td>
                  <td style={{ padding:'11px 12px' }}><ScoreBadge score={lead.score}/></td>
                  <td style={{ padding:'11px 12px',fontSize:13,color:'#374151' }}>{lead.assignee}</td>
                  <td style={{ padding:'11px 12px',fontSize:13,color:'#10B981',fontWeight:600 }}>{lead.budget}</td>
                  <td style={{ padding:'11px 12px',fontSize:12,color:'#F59E0B',fontWeight:500 }}>{lead.nextFollowUp}</td>
                  <td style={{ padding:'11px 12px' }}>
                    {lead.lineId
                      ? <span style={{ color:'#4ADE80',fontSize:12 }}>✓ Linked</span>
                      : <span style={{ color:'#94A3B8',fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex',gap:4 }}>
                      <button onClick={()=>setModalLead(lead)} style={{ background:'#EEF2FF',border:'none',borderRadius:6,padding:'4px 8px',fontSize:11,color:'#6366F1',cursor:'pointer',fontWeight:600 }}>Edit</button>
                      <button onClick={()=>setDeleteTarget(lead)} style={{ background:'#FEF2F2',border:'none',borderRadius:6,padding:'4px 8px',fontSize:11,color:'#EF4444',cursor:'pointer',fontWeight:600 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'48px 24px',textAlign:'center' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
              <div style={{ fontSize:14,fontWeight:600,color:'#64748B' }}>No leads found</div>
              <div style={{ fontSize:12,color:'#94A3B8',marginTop:4 }}>Try adjusting your filters or add a new lead</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {csvRows && (
        <CSVImportModal
          rows={csvRows}
          onClose={() => setCsvRows(null)}
          onImport={async newLeads => {
            try {
              const created = await window.api.leads.bulk(newLeads);
              setLeads(ls => [...created.map(fmt), ...ls]);
            } catch (err) { setErrMsg(err.message); }
          }}
        />
      )}
      {(modalLead || showNew) && (
        <LeadModal
          lead={showNew ? null : modalLead}
          users={users}
          onClose={()=>{ setModalLead(null); setShowNew(false); }}
          onSave={async form => {
            try {
              if (showNew) {
                const created = await window.api.leads.create(form);
                setLeads(ls => [fmt(created), ...ls]);
              } else {
                const updated = await window.api.leads.update(modalLead.id, form);
                setLeads(ls => ls.map(l => l.id === modalLead.id ? fmt(updated) : l));
              }
            } catch (err) { setErrMsg(err.message); }
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          lead={deleteTarget}
          onClose={()=>setDeleteTarget(null)}
          onConfirm={async id => {
            try { await window.api.leads.remove(id); setLeads(ls => ls.filter(l => l.id !== id)); }
            catch (err) { setErrMsg(err.message); }
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { LeadsView, STATUS_CONFIG, SCORE_CONFIG });
