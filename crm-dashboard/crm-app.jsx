
// CRM App Root — router + shell + tweaks
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#6366F1",
  "sidebarDark": true,
  "compactMode": false,
  "accentLine": "#4ADE80",
  "fontScale": 1,
  "darkMode": false
}/*EDITMODE-END*/;

function NewCampaignModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name:'', source:'Facebook Ads', status:'active',
    budget:'', startDate:'', endDate:'', description:'', utm_campaign:'', utm_medium:'', utm_source:'',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inputStyle = { width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',background:'#FAFAFA',outline:'none',boxSizing:'border-box' };
  const labelStyle = { fontSize:11,fontWeight:600,color:'#64748B',marginBottom:4,display:'block' };
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,width:'100%',maxWidth:580,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:'20px 24px',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:'#0F172A' }}>⚡ New Campaign</h3>
            <p style={{ margin:'2px 0 0',fontSize:12,color:'#94A3B8' }}>Create a new lead generation campaign</p>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#64748B' }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding:'20px 24px',display:'flex',flexDirection:'column',gap:18 }}>
          {/* Campaign Info */}
          <div>
            <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.05em' }}>Campaign Info</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div style={{ gridColumn:'span 2' }}>
                <label style={labelStyle}>Campaign Name *</label>
                <input value={form.name} onChange={e=>set('name',e.target.value)} style={inputStyle} placeholder="e.g. Summer Sale 2026"/>
              </div>
              <div>
                <label style={labelStyle}>Source / Channel</label>
                <select value={form.source} onChange={e=>set('source',e.target.value)} style={inputStyle}>
                  {['Facebook Ads','Google Ads','LINE Ads','Email Campaign','Referral','Organic','Walk-in','Other'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e=>set('status',e.target.value)} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="ended">Ended</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Budget (฿)</label>
                <input value={form.budget} onChange={e=>set('budget',e.target.value)} style={inputStyle} placeholder="e.g. 50000"/>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} style={{ ...inputStyle,height:70,resize:'vertical' }} placeholder="Campaign objective, target audience..."/>
              </div>
            </div>
          </div>
          {/* UTM Tracking */}
          <div>
            <div style={{ fontSize:12,fontWeight:700,color:'#F59E0B',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.05em' }}>UTM Tracking</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
              {[['utm_source','utm_source',form.utm_source],['utm_medium','utm_medium',form.utm_medium],['utm_campaign','utm_campaign',form.utm_campaign]].map(([k,l,v])=>(
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input value={v} onChange={e=>set(k,e.target.value)} style={inputStyle} placeholder={l}/>
                </div>
              ))}
            </div>
            {(form.utm_source||form.utm_medium||form.utm_campaign) && (
              <div style={{ marginTop:10,background:'#F8FAFC',borderRadius:8,padding:'8px 12px',border:'1px solid #E2E8F0' }}>
                <div style={{ fontSize:10,color:'#94A3B8',marginBottom:4,fontWeight:600 }}>Preview URL</div>
                <div style={{ fontSize:11,color:'#374151',wordBreak:'break-all' }}>
                  https://yoursite.com/landing?utm_source={form.utm_source||'...'}&utm_medium={form.utm_medium||'...'}&utm_campaign={form.utm_campaign||'...'}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:'16px 24px',borderTop:'1px solid #F1F5F9',display:'flex',gap:8,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
          <button onClick={()=>{ if(form.name.trim()) { onSave(form); onClose(); } }} style={{ background: form.name.trim()?'#6366F1':'#C7D2FE',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:form.name.trim()?'pointer':'not-allowed',color:'white' }}>
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignsView() {
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState([
    { name: 'Summer Sale 2026',  source: 'Facebook Ads',   status: 'active',  leads: 248, won: 42, budget: '฿50,000',  spent: '฿38,200', conv: 17 },
    { name: 'Q2 Google Search',  source: 'Google Ads',     status: 'active',  leads: 195, won: 38, budget: '฿80,000',  spent: '฿61,500', conv: 19 },
    { name: 'LINE OA Blast May', source: 'LINE Ads',       status: 'active',  leads: 180, won: 48, budget: '฿30,000',  spent: '฿29,800', conv: 27 },
    { name: 'Referral Program',  source: 'Referral',       status: 'active',  leads: 150, won: 52, budget: '฿10,000',  spent: '฿7,400',  conv: 35 },
    { name: 'Apr Email Blast',   source: 'Email Campaign', status: 'ended',   leads: 90,  won: 18, budget: '฿5,000',   spent: '฿5,000',  conv: 20 },
    { name: 'Mar Brand Awareness',source: 'Facebook Ads',  status: 'ended',   leads: 320, won: 28, budget: '฿120,000', spent: '฿118,600',conv: 9  },
  ]);
  const statusCfg = { active: ['#ECFDF5','#10B981'], paused: ['#FFF7ED','#F97316'], ended: ['#F1F5F9','#94A3B8'], draft: ['#F5F3FF','#8B5CF6'] };

  const handleSave = (form) => {
    const budgetNum = parseInt(form.budget.replace(/[฿,]/g,'')) || 0;
    setCampaigns(cs => [...cs, {
      name: form.name, source: form.source, status: form.status,
      leads: 0, won: 0, conv: 0,
      budget: budgetNum ? `฿${budgetNum.toLocaleString()}` : '฿0',
      spent: '฿0',
    }]);
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {showModal && <NewCampaignModal onClose={()=>setShowModal(false)} onSave={handleSave}/>}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>Campaigns</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>{campaigns.length} campaigns · Track spend & conversion</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer' }}>+ New Campaign</button>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
        {campaigns.map((c,i) => {
          const [sbg, scol] = statusCfg[c.status];
          const spentPct = Math.round((parseInt(c.spent.replace(/[฿,]/g,''))/parseInt(c.budget.replace(/[฿,]/g,'')))*100);
          return (
            <div key={i} style={{ background:'#fff',borderRadius:12,padding:'18px 20px',border:'1px solid #E2E8F0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div style={{ flex:1,marginRight:10 }}>
                  <div style={{ fontWeight:700,fontSize:14,color:'#0F172A',marginBottom:4 }}>{c.name}</div>
                  <div style={{ fontSize:12,color:'#64748B' }}>{c.source}</div>
                </div>
                <span style={{ background:sbg,color:scol,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700,whiteSpace:'nowrap' }}>{c.status}</span>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12 }}>
                {[['Leads',c.leads,'#6366F1'],['Won',c.won,'#10B981'],['Conv.',c.conv+'%','#F59E0B']].map(([l,v,col])=>(
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18,fontWeight:700,color:col }}>{v}</div>
                    <div style={{ fontSize:10,color:'#94A3B8' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:4 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:11,color:'#64748B' }}>Budget spent</span>
                  <span style={{ fontSize:11,fontWeight:700,color:'#0F172A' }}>{c.spent} / {c.budget}</span>
                </div>
                <div style={{ height:6,background:'#F1F5F9',borderRadius:3,overflow:'hidden' }}>
                  <div style={{ width:spentPct+'%',height:'100%',background: spentPct>90?'#EF4444':'#6366F1',borderRadius:3,transition:'width 0.5s' }}/>
                </div>
                <div style={{ fontSize:10,color:'#94A3B8',marginTop:2,textAlign:'right' }}>{spentPct}% used</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyProfileView({ currentUser, onNavigate }) {
  const [form, setForm] = useState({
    name: currentUser?.name || 'Admin สมศักดิ์',
    email: 'admin@crm.th',
    phone: '081-234-5678',
    department: 'Management',
    lineId: 'U001abc',
    role: currentUser?.role || 'SUPER_ADMIN',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('profile');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const stats = [
    { label: 'Leads Managed', value: '1,284', color: '#6366F1' },
    { label: 'Won Leads',     value: '237',   color: '#10B981' },
    { label: 'Campaigns',     value: '6',     color: '#F59E0B' },
    { label: 'Reports Sent',  value: '42',    color: '#06B6D4' },
  ];

  const activities = [
    { action: 'Created lead สมชาย ใจดี',        time: '2h ago',  color: '#6366F1' },
    { action: 'Updated pipeline stage for XYZ',  time: '4h ago',  color: '#8B5CF6' },
    { action: 'Sent daily report via LINE OA',   time: '8:00 AM', color: '#4ADE80' },
    { action: 'Imported 12 leads from CSV',      time: 'Yesterday',color: '#F59E0B' },
    { action: 'Won lead: กมลา จริยา (฿90K)',    time: '2d ago',  color: '#10B981' },
  ];

  const inputStyle = { width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',background:'#FAFAFA',outline:'none',boxSizing:'border-box' };
  const labelStyle = { fontSize:11,fontWeight:600,color:'#64748B',marginBottom:5,display:'block' };
  const cardStyle  = { background:'#fff',borderRadius:12,padding:'24px',border:'1px solid #E2E8F0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' };

  const roleColors = { SUPER_ADMIN:['#EEF2FF','#6366F1'], ADMIN:['#FFFBEB','#F59E0B'], USER:['#F0FDF4','#10B981'] };
  const [rbg, rcol] = roleColors[form.role] || roleColors.USER;

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:24,maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>My Profile</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>Manage your account and preferences</p>
        </div>
        <button onClick={() => onNavigate('dashboard')} style={{ background:'#F1F5F9',border:'1px solid #E2E8F0',borderRadius:8,padding:'8px 14px',fontSize:13,color:'#374151',cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>
      </div>

      {/* Profile hero card */}
      <div style={{ ...cardStyle, display:'flex',alignItems:'center',gap:24,flexWrap:'wrap' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#F59E0B,#EF4444)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:28 }}>
            {form.name.charAt(0)}
          </div>
          <div style={{ position:'absolute',bottom:2,right:2,width:20,height:20,borderRadius:'50%',background:'#10B981',border:'2px solid white',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:'white' }}/>
          </div>
        </div>
        <div style={{ flex:1,minWidth:200 }}>
          <div style={{ fontSize:20,fontWeight:700,color:'#0F172A',marginBottom:4 }}>{form.name}</div>
          <div style={{ fontSize:13,color:'#64748B',marginBottom:8 }}>{form.email}</div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
            <span style={{ background:rbg,color:rcol,borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700 }}>{form.role}</span>
            <span style={{ background:'#F0FDF4',color:'#10B981',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#10B981' }}/> Active
            </span>
            {form.lineId && (
              <span style={{ background:'#F0FDF9',color:'#4ADE80',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:600,border:'1px solid #4ADE8030' }}>
                LINE Linked
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ textAlign:'center',background:'#F8FAFC',borderRadius:10,padding:'12px 16px' }}>
              <div style={{ fontSize:20,fontWeight:700,color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10,color:'#94A3B8',marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:4,background:'#F1F5F9',borderRadius:10,padding:4,width:'fit-content' }}>
        {[['profile','Profile Info'],['password','Password'],['activity','Activity Log']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab===id ? '#fff' : 'transparent', border:'none', borderRadius:8,
            padding:'8px 18px', fontSize:13, fontWeight: tab===id ? 600 : 400,
            color: tab===id ? '#0F172A' : '#64748B', cursor:'pointer',
            boxShadow: tab===id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {tab === 'profile' && (
        <div style={cardStyle}>
          <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>Personal Information</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e=>set('name',e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input value={form.email} onChange={e=>set('email',e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input value={form.phone} onChange={e=>set('phone',e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input value={form.department} onChange={e=>set('department',e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>LINE User ID</label>
              <input value={form.lineId} onChange={e=>set('lineId',e.target.value)} style={inputStyle} placeholder="Uxxxxxxxxxx"/>
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <input readOnly value={form.role} style={{ ...inputStyle, background:'#F1F5F9', color:'#94A3B8', cursor:'not-allowed' }}/>
            </div>
          </div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end', gap:8 }}>
            {saved && <span style={{ fontSize:12,color:'#10B981',fontWeight:600,display:'flex',alignItems:'center',gap:4,padding:'8px 0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Saved successfully
            </span>}
            <button onClick={handleSave} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:600,cursor:'pointer' }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div style={cardStyle}>
          <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>Change Password</div>
          <div style={{ display:'flex',flexDirection:'column',gap:14,maxWidth:400 }}>
            {[['current','Current Password'],['next','New Password'],['confirm','Confirm New Password']].map(([k,l]) => (
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <input type="password" value={pwForm[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))} style={inputStyle} placeholder="••••••••"/>
              </div>
            ))}
            <div style={{ background:'#F8FAFC',borderRadius:8,padding:'12px 14px',fontSize:12,color:'#64748B' }}>
              Password must be at least 8 characters and include a number and special character.
            </div>
            <button style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:600,cursor:'pointer',alignSelf:'flex-start' }}>Update Password</button>
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {tab === 'activity' && (
        <div style={cardStyle}>
          <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>Recent Activity</div>
          <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
            {activities.map((a, i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom: i<activities.length-1 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:a.color,flexShrink:0 }}/>
                <div style={{ flex:1,fontSize:13,color:'#374151' }}>{a.action}</div>
                <div style={{ fontSize:11,color:'#94A3B8',whiteSpace:'nowrap' }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  const [org, setOrg] = useState({ companyName:'CRM Lead Copilot Co.', timezone:'Asia/Bangkok', language:'Thai / English', currency:'THB (฿)', website:'https://crm.example.co.th', address:'Bangkok, Thailand' });
  const [scoring, setScoring] = useState({ phone:20, lineId:20, budget:15, paidSource:15, highInterest:10, contactRequested:20 });
  const [notifs, setNotifs] = useState({ email:true, browser:true, line:true, weeklyDigest:false });
  const [api, setApi] = useState({ rateLimit:'100', webhookUrl:'/api/line/webhook', cronSecret:'••••••••••••' });
  const [saved, setSaved] = useState('');
  const [activeSection, setActiveSection] = useState('org');

  const save = (section) => { setSaved(section); setTimeout(() => setSaved(''), 2000); };

  const inputStyle = { width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',background:'#fff',outline:'none',boxSizing:'border-box',transition:'border-color 0.15s' };
  const labelStyle = { fontSize:11,fontWeight:600,color:'#64748B',marginBottom:5,display:'block' };
  const cardStyle  = { background:'#fff',borderRadius:12,padding:'24px',border:'1px solid #E2E8F0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' };
  const SaveBtn = ({ section }) => (
    <div style={{ display:'flex',justifyContent:'flex-end',alignItems:'center',gap:10,marginTop:20,paddingTop:16,borderTop:'1px solid #F1F5F9' }}>
      {saved === section && <span style={{ fontSize:12,color:'#10B981',fontWeight:600,display:'flex',alignItems:'center',gap:4 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#10B981"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Saved</span>}
      <button onClick={() => save(section)} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer' }}>Save Changes</button>
    </div>
  );
  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width:40,height:22,borderRadius:11,background:value?'#6366F1':'#E2E8F0',position:'relative',cursor:'pointer',transition:'background 0.2s',flexShrink:0 }}>
      <div style={{ width:16,height:16,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:value?21:3,transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  );

  const sections = [
    { id:'org',     label:'Organization',   icon:'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z' },
    { id:'scoring', label:'Lead Scoring',   icon:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z' },
    { id:'notifs',  label:'Notifications',  icon:'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' },
    { id:'api',     label:'API & Security', icon:'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
  ];

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>Settings</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>System configuration & preferences</p>
        </div>
      </div>

      <div style={{ display:'flex',gap:20,alignItems:'flex-start' }}>
        {/* Sidebar nav */}
        <div style={{ width:200,flexShrink:0,background:'#fff',borderRadius:12,padding:'8px',border:'1px solid #E2E8F0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',
              background: activeSection===s.id ? '#EEF2FF' : 'transparent',
              border:'none',borderRadius:8,cursor:'pointer',textAlign:'left',
              color: activeSection===s.id ? '#6366F1' : '#374151',
              fontSize:13,fontWeight: activeSection===s.id ? 600 : 400,marginBottom:2,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon}/></svg>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1 }}>
          {activeSection === 'org' && (
            <div style={cardStyle}>
              <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>Organization</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                {[['companyName','Company Name','text'],['timezone','Timezone','select-tz'],['language','Language','select-lang'],['currency','Currency','select-cur'],['website','Website URL','url'],['address','Address','text']].map(([k,l,t]) => (
                  <div key={k} style={ k==='address' ? {gridColumn:'span 2'} : {}}>
                    <label style={labelStyle}>{l}</label>
                    {t.startsWith('select') ? (
                      <select value={org[k]} onChange={e=>setOrg(o=>({...o,[k]:e.target.value}))} style={inputStyle}>
                        {t==='select-tz' && ['Asia/Bangkok','Asia/Singapore','Asia/Tokyo','UTC','Europe/London'].map(v=><option key={v}>{v}</option>)}
                        {t==='select-lang' && ['Thai / English','Thai','English'].map(v=><option key={v}>{v}</option>)}
                        {t==='select-cur' && ['THB (฿)','USD ($)','SGD (S$)','JPY (¥)'].map(v=><option key={v}>{v}</option>)}
                      </select>
                    ) : (
                      <input type={t} value={org[k]} onChange={e=>setOrg(o=>({...o,[k]:e.target.value}))} style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='#6366F1'} onBlur={e=>e.target.style.borderColor='#E2E8F0'}/>
                    )}
                  </div>
                ))}
              </div>
              <SaveBtn section="org"/>
            </div>
          )}

          {activeSection === 'scoring' && (
            <div style={cardStyle}>
              <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.05em' }}>Lead Scoring</div>
              <p style={{ fontSize:12,color:'#94A3B8',marginBottom:20 }}>Total max score: {Object.values(scoring).reduce((a,b)=>a+b,0)} pts</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                {[['phone','Phone number exists'],['lineId','LINE User ID linked'],['budget','Budget provided'],['paidSource','Source is paid campaign'],['highInterest','Interest level: High'],['contactRequested','User requested contact']].map(([k,l]) => (
                  <div key={k} style={{ background:'#F8FAFC',borderRadius:10,padding:'14px 16px',border:'1px solid #E2E8F0' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                      <span style={{ fontSize:12,fontWeight:600,color:'#374151' }}>{l}</span>
                      <span style={{ fontSize:18,fontWeight:700,color:'#6366F1' }}>+{scoring[k]}</span>
                    </div>
                    <input type="range" min="0" max="30" value={scoring[k]} onChange={e=>setScoring(s=>({...s,[k]:+e.target.value}))} style={{ width:'100%',accentColor:'#6366F1' }}/>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'#94A3B8',marginTop:2 }}><span>0</span><span>30</span></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16,padding:'12px 16px',background:'#EEF2FF',borderRadius:8,display:'flex',gap:16,flexWrap:'wrap' }}>
                {[['80–100','HOT','#EF4444'],['50–79','WARM','#F59E0B'],['0–49','COLD','#94A3B8']].map(([range,label,color])=>(
                  <div key={label} style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <span style={{ background:color+'20',color,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700 }}>{label}</span>
                    <span style={{ fontSize:11,color:'#64748B' }}>{range} pts</span>
                  </div>
                ))}
              </div>
              <SaveBtn section="scoring"/>
            </div>
          )}

          {activeSection === 'notifs' && (
            <div style={cardStyle}>
              <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>Notifications</div>
              {[['email','Email Notifications','Receive alerts via email'],['browser','Browser Push','Desktop push notifications'],['line','LINE Notifications','Push messages via LINE OA'],['weeklyDigest','Weekly Digest','Summary email every Monday 8AM']].map(([k,l,desc]) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #F8FAFC' }}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:'#0F172A' }}>{l}</div>
                    <div style={{ fontSize:11,color:'#94A3B8',marginTop:2 }}>{desc}</div>
                  </div>
                  <Toggle value={notifs[k]} onChange={v=>setNotifs(n=>({...n,[k]:v}))}/>
                </div>
              ))}
              <SaveBtn section="notifs"/>
            </div>
          )}

          {activeSection === 'api' && (
            <div style={cardStyle}>
              <div style={{ fontSize:12,fontWeight:700,color:'#6366F1',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.05em' }}>API & Security</div>
              {[['rateLimit','Public API Rate Limit (req/min)','number'],['webhookUrl','LINE Webhook URL','url'],['cronSecret','Cron Secret Key','password']].map(([k,l,t]) => (
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={labelStyle}>{l}</label>
                  <input type={t} value={api[k]} onChange={e=>setApi(a=>({...a,[k]:e.target.value}))} style={inputStyle}
                    onFocus={e=>e.target.style.borderColor='#6366F1'} onBlur={e=>e.target.style.borderColor='#E2E8F0'}/>
                </div>
              ))}
              <div style={{ background:'#FFFBEB',borderRadius:8,padding:'12px 14px',fontSize:12,color:'#92400E',marginTop:4 }}>
                <strong>Security note:</strong> Never expose LINE Channel Access Token or Cron Secret in frontend code. Store secrets in environment variables only.
              </div>
              <SaveBtn section="api"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopBar({ page, onSearch, onNavigate, currentUser }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const PAGE_TITLES = {
    dashboard:'Dashboard', leads:'Leads', pipeline:'Pipeline',
    campaigns:'Campaigns', reports:'Reports & Analytics',
    users:'Users', 'line-oa':'LINE OA Settings', settings:'Settings', profile:'My Profile',
  };

  const notifs = [
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>, text:'Hot lead: สมชาย ใจดี (Score 95)', time:'2m ago', color:'#FEF2F2' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>, text:'Follow-up overdue: Priya Sharma', time:'15m ago', color:'#FFFBEB' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366F1"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>, text:'New lead from Facebook Ads', time:'1h ago', color:'#EEF2FF' },
  ];

  const menuItems = [
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>, label:'My Profile',       action: () => { onNavigate('profile'); setShowUserMenu(false); } },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>, label:'Change Password',  action: () => setShowUserMenu(false) },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>, label:'Manage Users',     action: () => { onNavigate('users'); setShowUserMenu(false); } },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M19.14 12.94c.04-.27.07-.55.07-.83s-.03-.57-.07-.84l1.84-1.44c.17-.13.21-.37.1-.55l-1.75-3.03c-.11-.19-.34-.25-.54-.19l-2.17.87c-.46-.35-.95-.64-1.47-.86l-.33-2.3c-.04-.21-.22-.37-.44-.37h-3.5c-.22 0-.4.16-.44.37l-.33 2.3c-.52.22-1.01.51-1.47.86l-2.17-.87c-.2-.07-.43 0-.54.19L3.71 9.66c-.11.18-.07.42.1.55l1.84 1.44c-.04.27-.07.56-.07.84s.03.56.07.83l-1.84 1.44c-.17.13-.21.37-.1.55l1.75 3.03c.11.19.34.25.54.19l2.17-.87c.46.35.95.64 1.47.86l.33 2.3c.04.21.22.37.44.37h3.5c.22 0 .4-.16.44-.37l.33-2.3c.52-.22 1.01-.51 1.47-.86l2.17.87c.2.07.43 0 .54-.19l1.75-3.03c.11-.18.07-.42-.1-.55l-1.84-1.44zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>, label:'Settings',         action: () => { onNavigate('settings'); setShowUserMenu(false); } },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#4ADE80"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V9h12v3zm0-4H6V5h12v3z"/></svg>, label:'LINE OA Settings', action: () => { onNavigate('line-oa'); setShowUserMenu(false); } },
    { divider: true },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#EF4444"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>, label:'Sign Out', action: () => {
      localStorage.removeItem('crm_auth');
      sessionStorage.removeItem('crm_auth');
      window.location.href = 'Login.html';
    }, danger: true },
  ];

  return (
    <header style={{
      height:56, background:'#fff', borderBottom:'1px solid #E2E8F0',
      display:'flex', alignItems:'center', padding:'0 24px', gap:16,
      position:'sticky', top:0, zIndex:5,
    }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:14, fontWeight:600, color:'#64748B' }}>
          {PAGE_TITLES[page] || page}
        </span>
      </div>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94A3B8',fontSize:13 }}>🔍</span>
        <input onChange={e=>onSearch(e.target.value)} placeholder="Quick search..." style={{ padding:'7px 10px 7px 30px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:12,outline:'none',width:200,color:'#374151' }}/>
      </div>

      {/* Notifications */}
      <div style={{ position:'relative' }}>
        <button onClick={()=>{ setShowNotifs(v=>!v); setShowUserMenu(false); }} style={{ background:'#FEF3C7',border:'none',borderRadius:8,padding:'6px 10px',fontSize:12,fontWeight:600,color:'#92400E',cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#92400E"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span style={{ background:'#EF4444',color:'white',borderRadius:10,fontSize:10,fontWeight:700,padding:'0 5px' }}>{notifs.length}</span>
        </button>
        {showNotifs && (
          <>
            <div style={{ position:'fixed',inset:0,zIndex:98 }} onClick={()=>setShowNotifs(false)}/>
            <div style={{ position:'absolute',right:0,top:'calc(100% + 8px)',width:320,background:'#fff',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.14)',border:'1px solid #E2E8F0',zIndex:99,overflow:'hidden' }}>
              <div style={{ padding:'14px 16px',borderBottom:'1px solid #F1F5F9',fontWeight:700,fontSize:13,color:'#0F172A' }}>Notifications</div>
              {notifs.map((n,i)=>(
                <div key={i} onClick={()=>setShowNotifs(false)} style={{ display:'flex',gap:10,padding:'12px 16px',borderBottom:'1px solid #F8FAFC',cursor:'pointer',background:'#fff',transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                >
                  <div style={{ width:34,height:34,borderRadius:8,background:n.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>{n.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,color:'#0F172A',fontWeight:500,lineHeight:1.4 }}>{n.text}</div>
                    <div style={{ fontSize:11,color:'#94A3B8',marginTop:2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding:'10px 16px',textAlign:'center' }}>
                <button style={{ background:'none',border:'none',fontSize:12,color:'#6366F1',fontWeight:600,cursor:'pointer' }}>View all notifications</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User menu */}
      <div style={{ position:'relative' }}>
        <div onClick={()=>{ setShowUserMenu(v=>!v); setShowNotifs(false); }} style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'4px 8px',borderRadius:8,transition:'background 0.1s' }}
          onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >
          <div style={{ width:32,height:32,borderRadius:'50%',background:currentUser?.color||'linear-gradient(135deg,#F59E0B,#EF4444)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:12,flexShrink:0 }}>
            {currentUser?.initials||'SA'}
          </div>
          <div style={{ lineHeight:1.2 }}>
            <div style={{ fontSize:12,fontWeight:600,color:'#0F172A' }}>{currentUser?.name||'Super Admin'}</div>
            <div style={{ fontSize:10,color:'#94A3B8' }}>{currentUser?.role||'SUPER_ADMIN'}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" style={{ marginLeft:2, transform: showUserMenu?'rotate(180deg)':'none', transition:'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {showUserMenu && (
          <>
            <div style={{ position:'fixed',inset:0,zIndex:98 }} onClick={()=>setShowUserMenu(false)}/>
            <div style={{ position:'absolute',right:0,top:'calc(100% + 8px)',width:220,background:'#fff',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.14)',border:'1px solid #E2E8F0',zIndex:99,overflow:'hidden',padding:'6px' }}>
              {/* User info header */}
              <div style={{ padding:'12px 12px 10px',borderBottom:'1px solid #F1F5F9',marginBottom:4 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#F59E0B,#EF4444)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13 }}>
                    {currentUser?.initials||'SA'}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:'#0F172A' }}>{currentUser?.name}</div>
                    <div style={{ fontSize:10,color:'#94A3B8' }}>admin@crm.th</div>
                  </div>
                </div>
                <div style={{ marginTop:8,background:'#EEF2FF',borderRadius:6,padding:'4px 10px',display:'inline-flex',alignItems:'center',gap:4 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:'#6366F1' }}/>
                  <span style={{ fontSize:10,fontWeight:700,color:'#6366F1' }}>{currentUser?.role}</span>
                </div>
              </div>
              {/* Menu items */}
              {menuItems.map((item, i) => item.divider
                ? <div key={i} style={{ height:1,background:'#F1F5F9',margin:'4px 0' }}/>
                : (
                  <button key={i} onClick={item.action} style={{
                    display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',
                    background:'transparent',border:'none',borderRadius:8,cursor:'pointer',textAlign:'left',
                    color: item.danger ? '#EF4444' : '#374151', fontSize:13,fontWeight:500,
                    transition:'background 0.1s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=item.danger?'#FEF2F2':'#F8FAFC'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <span style={{ fontSize:15 }}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function CRMApp() {
  const [page, setPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useState(false);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('crm_auth') || sessionStorage.getItem('crm_auth');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return { name: 'Admin สมศักดิ์', role: 'SUPER_ADMIN', initials: 'SA', color: 'linear-gradient(135deg,#F59E0B,#EF4444)' };
  })();

  // Auth guard — redirect to login if no session
  useEffect(() => {
    const auth = localStorage.getItem('crm_auth') || sessionStorage.getItem('crm_auth');
    if (!auth) window.location.href = 'Login.html';
  }, []);

  // Tweaks protocol
  useEffect(() => {
    const handler = e => {
      if (e.data?.type === '__activate_edit_mode') setShowTweaks(true);
      if (e.data?.type === '__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const setTweak = (key, val) => {
    setTweaks(t => {
      const next = { ...t, [key]: val };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
      return next;
    });
  };

  const VIEW_MAP = {
    dashboard: <MainDashboard onNavigate={setPage}/>,
    leads:     <LeadsView/>,
    pipeline:  <PipelineView/>,
    campaigns: <CampaignsView/>,
    reports:   <ReportsView/>,
    users:     <UsersView/>,
    'line-oa': <LineOAView/>,
    settings:  <SettingsView/>,
    profile:   <MyProfileView currentUser={currentUser} onNavigate={setPage}/>,
  };

  // Dark mode injection
  useEffect(() => {
    let el = document.getElementById('crm-dark-mode');
    if (!el) { el = document.createElement('style'); el.id = 'crm-dark-mode'; document.head.appendChild(el); }
    el.textContent = tweaks.darkMode ? `
      body { background:#0F172A!important; }
      header { background:#1E293B!important; border-color:#334155!important; }
      main { background:#0F172A!important; }
      h1,h2,h3 { color:#F1F5F9!important; }
      [style*='background: rgb(255, 255, 255)'],
      [style*='background:#fff'] { background:#1E293B!important; color:#E2E8F0!important; }
      input,select,textarea { background:#0F172A!important; color:#E2E8F0!important; border-color:#334155!important; }
      [style*='color: rgb(15, 23, 42)'] { color:#F1F5F9!important; }
      [style*='color: rgb(100, 116, 139)'] { color:#94A3B8!important; }
      [style*='background: rgb(241, 245, 249)'] { background:#1E293B!important; }
      [style*='border: 1px solid rgb(226, 232, 240)'] { border-color:#334155!important; }
      table { color:#E2E8F0!important; }
      td { color:#CBD5E1!important; }
      th { color:#94A3B8!important; }
    ` : '';
  }, [tweaks.darkMode]);

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize: `${tweaks.fontScale * 14}px`, background: tweaks.darkMode ? '#0F172A' : '#F1F5F9' }}>
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        currentUser={currentUser}
      />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <TopBar page={page} onSearch={setSearch} onNavigate={setPage} currentUser={currentUser}/>
        <main style={{ flex:1, padding:'24px', overflowY:'auto' }}>
          {VIEW_MAP[page] || <MainDashboard onNavigate={setPage}/>}
        </main>
      </div>

      {/* Tweaks panel */}
      {showTweaks && (
        <TweaksPanel onClose={() => { setShowTweaks(false); window.parent.postMessage({type:'__edit_mode_dismissed'},'*'); }}>
          <TweakSection title="Brand">
            <TweakColor label="Primary Color" id="primaryColor" value={tweaks.primaryColor} options={['#6366F1','#2563EB','#0891B2','#059669','#DC2626']} onChange={v=>setTweak('primaryColor',v)}/>
            <TweakColor label="LINE Accent" id="accentLine" value={tweaks.accentLine} options={['#4ADE80','#00C851','#06B6D4','#A78BFA']} onChange={v=>setTweak('accentLine',v)}/>
          </TweakSection>
          <TweakSection title="Layout">
            <TweakToggle label="Dark Mode" id="darkMode" value={tweaks.darkMode} onChange={v=>setTweak('darkMode',v)}/>
            <TweakToggle label="Dark Sidebar" id="sidebarDark" value={tweaks.sidebarDark} onChange={v=>setTweak('sidebarDark',v)}/>
            <TweakToggle label="Compact Mode" id="compactMode" value={tweaks.compactMode} onChange={v=>setTweak('compactMode',v)}/>
            <TweakSlider label="Font Scale" id="fontScale" value={tweaks.fontScale} min={0.8} max={1.3} step={0.05} onChange={v=>setTweak('fontScale',v)}/>
          </TweakSection>
          <TweakSection title="Navigation">
            <TweakSelect label="Start Page" id="startPage" value={page}
              options={['dashboard','leads','pipeline','campaigns','reports','users','line-oa','settings']}
              onChange={v=>setPage(v)}/>
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CRMApp/>);
