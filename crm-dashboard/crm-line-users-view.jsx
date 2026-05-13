
// CRM LINE OA Settings + Users View
const { useState } = React;

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: value ? '#4ADE80' : '#E2E8F0', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 23 : 3, transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }}/>
    </div>
  );
}

function LINEChatBubble({ msg, isBot }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
      {isBot && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🤖</div>
      )}
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isBot ? '#fff' : '#4ADE80',
        color: isBot ? '#0F172A' : '#14532D',
        fontSize: 13, lineHeight: 1.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        whiteSpace: 'pre-wrap',
      }}>{msg}</div>
    </div>
  );
}

function LINESimulator() {
  const [messages, setMessages] = useState([
    { text: 'สวัสดีครับ! ยินดีต้อนรับสู่ CRM Lead Copilot 🎉\n\nพิมพ์คำสั่งได้เลย:\n• report — รายงานวันนี้\n• leads — Hot leads\n• followup — งาน follow-up', isBot: true },
  ]);
  const [input, setInput] = useState('');

  const BOT_REPLIES = {
    report: `📊 CRM Daily Report — 12 May 2026\n\n🆕 New leads: 34\n🔥 Hot leads: 12\n✅ Won today: 6\n❌ Lost today: 2\n🔔 Follow-up due: 18\n\n📡 Top source: Facebook (12)\n💰 Pipeline value: ฿4.2M`,
    leads: `🔥 Top 5 Hot Leads\n\n1. สมชาย ใจดี — 95pts (ABC Corp)\n2. Natthawut K. — 88pts (XYZ Ltd)\n3. วิภา แสนดี — 84pts (DEF Co)\n4. Priya Sharma — 82pts (GHI Inc)\n5. มานะ รักดี — 80pts (JKL Pvt)`,
    followup: `🔔 Follow-up Today (18 tasks)\n\n⚠️ OVERDUE:\n• Priya Sharma → Mike T.\n• Anon Lee → Sara K.\n\n📅 Upcoming:\n• สมชาย ใจดี — 10:00 (John D.)\n• วิภา แสนดี — 11:30 (Sara K.)\n• มานะ รักดี — 14:00 (John D.)`,
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { text: input.trim(), isBot: false };
    const key = input.trim().toLowerCase();
    const botReply = BOT_REPLIES[key] || `ขออภัย ไม่เข้าใจคำสั่ง "${input}"\n\nคำสั่งที่รองรับ:\n• report\n• leads\n• followup`;
    setMessages(m => [...m, userMsg, { text: botReply, isBot: true }]);
    setInput('');
  };

  return (
    <div style={{ background: '#F0F9FF', borderRadius: 16, overflow: 'hidden', border: '2px solid #4ADE80' }}>
      {/* Phone header */}
      <div style={{ background: '#4ADE80', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#14532D' }}>CRM Lead Copilot OA</div>
          <div style={{ fontSize: 11, color: '#166534' }}>Official Account · Online</div>
        </div>
      </div>
      {/* Messages */}
      <div style={{ padding: 14, height: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, i) => <LINEChatBubble key={i} msg={m.text} isBot={m.isBot}/>)}
      </div>
      {/* Input */}
      <div style={{ padding: '10px 12px', background: '#fff', display: 'flex', gap: 8, borderTop: '1px solid #E2E8F0' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="ลองพิมพ์: report, leads, followup"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}
        />
        <button onClick={send} style={{ background: '#4ADE80', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#14532D', cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}

function LineOAView() {
  const [settings, setSettings] = useState({
    notifyNewLead: true, notifyHotLead: true, notifyFollowUp: true,
    dailyReport: true, dailyReportTime: '08:00',
    weeklyReport: false, monthlyReport: true,
    channelConnected: true,
  });
  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }));

  // ── Editable channel config ──
  const [channel, setChannel] = useState({
    channelId: '2006xxxxxxx',
    channelSecret: '',
    accessToken: '',
    liffId: '2006xxxxxx-xxxxxxxx',
    webhookUrl: '/api/line/webhook',
  });
  const [editField, setEditField] = useState(null);
  const [showSecret, setShowSecret] = useState({});
  const [configSaved, setConfigSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const setC = (k,v) => setChannel(c=>({...c,[k]:v}));

  const handleSaveConfig = () => {
    setEditField(null);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleTestConnection = () => {
    setTesting(true); setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(channel.channelId && channel.channelId !== '2006xxxxxxx' ? 'success' : 'error');
    }, 1800);
  };

  const recipients = [
    { name: 'Admin สมศักดิ์', role: 'SUPER_ADMIN', lineId: 'U001abc', status: 'active' },
    { name: 'John D.',         role: 'ADMIN',       lineId: 'U002def', status: 'active' },
    { name: 'Sara K.',         role: 'USER',        lineId: 'U003ghi', status: 'active' },
    { name: 'Mike T.',         role: 'USER',        lineId: 'U004jkl', status: 'inactive' },
  ];

  const logs = [
    { time: '08:00', event: 'Daily Report sent', recipients: 2, status: 'success' },
    { time: '09:14', event: 'New hot lead notify → Sara K.', recipients: 1, status: 'success' },
    { time: '10:00', event: 'Follow-up reminder → John D.', recipients: 1, status: 'success' },
    { time: '11:32', event: 'New lead created notify → Admin', recipients: 2, status: 'success' },
    { time: '14:05', event: 'Push message failed (quota)', recipients: 0, status: 'error' },
  ];

  const cardStyle = { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
  const CONFIG_FIELDS = [
    { key:'channelId',     label:'Channel ID',        env:'LINE_CHANNEL_ID',           secret:false, hint:'e.g. 2006xxxxxxx' },
    { key:'channelSecret', label:'Channel Secret',    env:'LINE_CHANNEL_SECRET',       secret:true,  hint:'32-char hex string' },
    { key:'accessToken',   label:'Channel Access Token',env:'LINE_CHANNEL_ACCESS_TOKEN',secret:true, hint:'Long-lived access token' },
    { key:'liffId',        label:'LIFF ID',           env:'LINE_LIFF_ID',              secret:false, hint:'e.g. 2006xxxxxx-xxxxxxxx' },
    { key:'webhookUrl',    label:'Webhook URL',       env:'AUTO',                      secret:false, hint:'Auto-generated endpoint' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>LINE OA Settings</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>LINE Official Account integration & notifications</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: settings.channelConnected ? '#ECFDF5' : '#FEF2F2', borderRadius: 8, padding: '8px 14px', border: `1px solid ${settings.channelConnected ? '#10B981' : '#EF4444'}30` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: settings.channelConnected ? '#10B981' : '#EF4444' }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: settings.channelConnected ? '#10B981' : '#EF4444' }}>
              {settings.channelConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button style={{ background: '#4ADE80', color: '#14532D', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:6}}><path d="M19.14 12.94c.04-.27.07-.55.07-.83s-.03-.57-.07-.84l1.84-1.44c.17-.13.21-.37.1-.55l-1.75-3.03c-.11-.19-.34-.25-.54-.19l-2.17.87c-.46-.35-.95-.64-1.47-.86l-.33-2.3c-.04-.21-.22-.37-.44-.37h-3.5c-.22 0-.4.16-.44.37l-.33 2.3c-.52.22-1.01.51-1.47.86l-2.17-.87c-.2-.07-.43 0-.54.19L3.71 9.66c-.11.18-.07.42.1.55l1.84 1.44c-.04.27-.07.56-.07.84s.03.56.07.83l-1.84 1.44c-.17.13-.21.37-.1.55l1.75 3.03c.11.19.34.25.54.19l2.17-.87c.46.35.95.64 1.47.86l.33 2.3c.04.21.22.37.44.37h3.5c.22 0 .4-.16.44-.37l.33-2.3c.52-.22 1.01-.51 1.47-.86l2.17.87c.2.07.43 0 .54-.19l1.75-3.03c.11-.18.07-.42-.1-.55l-1.84-1.44zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
            Test Message
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Channel config — editable */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, justifyContent:'space-between' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ background: '#4ADE80', borderRadius: 6, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#14532D"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V9h12v3zm0-4H6V5h12v3z"/></svg></span>
                Channel Configuration
              </div>
              <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                {configSaved && <span style={{ fontSize:11,color:'#10B981',fontWeight:600,display:'flex',alignItems:'center',gap:3 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="#10B981"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Saved</span>}
                <button onClick={handleTestConnection} disabled={testing} style={{ background: testing?'#F8FAFC':'#F0FDF4',color:testing?'#94A3B8':'#10B981',border:'1px solid #DCFCE7',borderRadius:7,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:testing?'not-allowed':'pointer' }}>
                  {testing ? 'Testing…' : 'Test Connection'}
                </button>
                {editField !== null
                  ? <button onClick={handleSaveConfig} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:7,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer' }}>Save All</button>
                  : <button onClick={()=>setEditField('all')} style={{ background:'#EEF2FF',color:'#6366F1',border:'none',borderRadius:7,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer' }}>Edit Config</button>
                }
              </div>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div style={{ marginBottom:12,padding:'8px 12px',borderRadius:8,background:testResult==='success'?'#ECFDF5':'#FEF2F2',border:`1px solid ${testResult==='success'?'#86EFAC':'#FECACA'}`,fontSize:12,color:testResult==='success'?'#166534':'#991B1B',fontWeight:600 }}>
                {testResult==='success'
                  ? '✓ Connection successful — LINE API responded correctly'
                  : '✗ Connection failed — check Channel ID and Access Token'}
              </div>
            )}

            {CONFIG_FIELDS.map(({ key, label, env, secret, hint }) => {
              const isEditing = editField === 'all';
              const val = channel[key];
              const shown = showSecret[key];
              const displayVal = key === 'webhookUrl'
                ? window.location.origin + val
                : (secret && !shown && val) ? '•'.repeat(Math.min(val.length || 22, 32)) : (val || '');
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4, display:'flex',alignItems:'center',gap:6 }}>
                    {label}
                    {env !== 'AUTO' && <span style={{ color: '#94A3B8', fontWeight: 400 }}>({env})</span>}
                    {key === 'webhookUrl' && <span style={{ background:'#EEF2FF',color:'#6366F1',borderRadius:4,padding:'1px 5px',fontSize:10,fontWeight:700 }}>AUTO</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems:'center' }}>
                    <input
                      readOnly={!isEditing || key==='webhookUrl'}
                      type={secret && !shown ? 'password' : 'text'}
                      value={isEditing && key!=='webhookUrl' ? val : displayVal}
                      onChange={e => setC(key, e.target.value)}
                      placeholder={isEditing ? hint : ''}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${isEditing&&key!=='webhookUrl'?'#6366F1':'#E2E8F0'}`, fontSize: 12, color: key==='webhookUrl'?'#6366F1':'#374151', background: key==='webhookUrl'?'#F0F9FF':isEditing?'#fff':'#F8FAFC', outline: 'none', fontFamily:'monospace' }}
                    />
                    {secret && val && (
                      <button onClick={()=>setShowSecret(s=>({...s,[key]:!s[key]}))} style={{ background:'#F1F5F9',border:'1px solid #E2E8F0',borderRadius:8,padding:'7px 9px',cursor:'pointer',flexShrink:0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#64748B"><path d={shown?'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z':'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'}/></svg>
                      </button>
                    )}
                    {key === 'webhookUrl' && (
                      <button onClick={()=>navigator.clipboard?.writeText(window.location.origin + val)} style={{ background:'#F1F5F9',border:'1px solid #E2E8F0',borderRadius:8,padding:'7px 9px',cursor:'pointer',flexShrink:0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#64748B"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Security warning */}
            <div style={{ background:'#FFFBEB',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#92400E',marginTop:4 }}>
              Never commit secrets to source code. Store Channel Secret &amp; Access Token in environment variables only.
            </div>
          </div>

          {/* Notification toggles */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 16, display:'flex', alignItems:'center', gap:8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#6366F1"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>Notification Rules</div>
            {[
              ['notifyNewLead',   'New Lead Created → Notify Admin'],
              ['notifyHotLead',   'Hot Lead (Score ≥80) → Notify Assigned Sales'],
              ['notifyFollowUp',  'Follow-up Due → Notify Assigned Sales'],
              ['dailyReport',     'Daily CRM Report (every morning)'],
              ['weeklyReport',    'Weekly Summary Report'],
              ['monthlyReport',   'Monthly Performance Report'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #F8FAFC' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                <Toggle value={settings[key]} onChange={() => toggle(key)}/>
              </div>
            ))}
            {settings.dailyReport && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDF4', borderRadius: 8, padding: '10px 14px', marginTop: -4 }}>
                <span style={{ fontSize: 12, color: '#166534' }}>Daily report time</span>
                <input type="time" value={settings.dailyReportTime} onChange={e => setSettings(s => ({ ...s, dailyReportTime: e.target.value }))}
                  style={{ border: '1px solid #86EFAC', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#166534', background: 'white', outline: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* LINE Simulator */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 16, display:'flex', alignItems:'center', gap:8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#4ADE80"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V9h12v3zm0-4H6V5h12v3z"/></svg>LINE Chat Simulator</div>
            <LINESimulator/>
          </div>

          {/* Recipients */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 16 }}>👥 LINE Recipients</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recipients.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${r.name.charCodeAt(0)*40%360},55%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {r.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.lineId}</div>
                  </div>
                  <span style={{ background: r.role === 'SUPER_ADMIN' ? '#EEF2FF' : r.role === 'ADMIN' ? '#FEF3C7' : '#F0FDF4', color: r.role === 'SUPER_ADMIN' ? '#6366F1' : r.role === 'ADMIN' ? '#F59E0B' : '#10B981', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{r.role}</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.status === 'active' ? '#4ADE80' : '#94A3B8' }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Message log */}
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 16, display:'flex', alignItems:'center', gap:8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>Message Log — Today</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < logs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: log.status === 'success' ? '#10B981' : '#EF4444', flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 38 }}>{log.time}</span>
                  <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{log.event}</span>
                  <span style={{ fontSize: 10, color: log.status === 'success' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    {log.status === 'success' ? `✓ ${log.recipients}` : '✗ fail'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== USERS VIEW =====================
const INITIAL_USERS = [
  { id:1, name:'Admin สมศักดิ์', email:'admin@crm.th',  role:'SUPER_ADMIN', leads:0,   status:'active',   joined:'01 Jan 2026', lineLinked:true,  phone:'081-000-0001', dept:'Management' },
  { id:2, name:'John D.',        email:'john@crm.th',   role:'ADMIN',       leads:320, status:'active',   joined:'15 Jan 2026', lineLinked:true,  phone:'081-111-2222', dept:'Sales' },
  { id:3, name:'Sara K.',        email:'sara@crm.th',   role:'USER',        leads:285, status:'active',   joined:'20 Jan 2026', lineLinked:true,  phone:'081-222-3333', dept:'Sales' },
  { id:4, name:'Mike T.',        email:'mike@crm.th',   role:'USER',        leads:248, status:'active',   joined:'01 Feb 2026', lineLinked:false, phone:'081-333-4444', dept:'Sales' },
  { id:5, name:'Amy R.',         email:'amy@crm.th',    role:'USER',        leads:198, status:'inactive', joined:'15 Feb 2026', lineLinked:false, phone:'081-444-5555', dept:'Sales' },
];

const ROLE_CFG = {
  SUPER_ADMIN:{ bg:'#EEF2FF', color:'#6366F1', label:'Super Admin' },
  ADMIN:      { bg:'#FFFBEB', color:'#F59E0B', label:'Admin' },
  USER:       { bg:'#F0FDF4', color:'#10B981', label:'User / Sales' },
};

function InviteUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'USER', dept:'Sales', sendEmail:true });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const iStyle = { width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',background:'#FAFAFA',outline:'none',boxSizing:'border-box' };
  const lStyle = { fontSize:11,fontWeight:600,color:'#64748B',marginBottom:4,display:'block' };
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:'#0F172A' }}>Invite User</h3>
            <p style={{ margin:'2px 0 0',fontSize:12,color:'#94A3B8' }}>Add a new team member</p>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#64748B' }}>✕</button>
        </div>
        <div style={{ padding:'20px 24px',display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div style={{ gridColumn:'span 2' }}><label style={lStyle}>Full Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} style={iStyle} placeholder="Full name"/></div>
            <div><label style={lStyle}>Email *</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={iStyle} placeholder="email@company.com"/></div>
            <div><label style={lStyle}>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} style={iStyle} placeholder="08x-xxx-xxxx"/></div>
            <div><label style={lStyle}>Role</label>
              <select value={form.role} onChange={e=>set('role',e.target.value)} style={iStyle}>
                {Object.entries(ROLE_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lStyle}>Department</label>
              <select value={form.dept} onChange={e=>set('dept',e.target.value)} style={iStyle}>
                {['Sales','Management','Marketing','Support','Other'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#F0FDF4',borderRadius:8,cursor:'pointer' }} onClick={()=>set('sendEmail',!form.sendEmail)}>
            <div style={{ width:18,height:18,borderRadius:4,background:form.sendEmail?'#10B981':'#E2E8F0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              {form.sendEmail && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            </div>
            <span style={{ fontSize:12,color:'#166534' }}>Send invitation email with login instructions</span>
          </div>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4 }}>
            <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
            <button onClick={()=>{ if(form.name&&form.email){ onSave(form); onClose(); } }} style={{ background:form.name&&form.email?'#6366F1':'#C7D2FE',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:form.name&&form.email?'pointer':'not-allowed',color:'white' }}>Send Invite</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const iStyle = { width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,color:'#0F172A',background:'#FAFAFA',outline:'none',boxSizing:'border-box' };
  const lStyle = { fontSize:11,fontWeight:600,color:'#64748B',marginBottom:4,display:'block' };
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,width:'100%',maxWidth:520,boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px',borderBottom:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:'#0F172A' }}>Edit User</h3>
            <p style={{ margin:'2px 0 0',fontSize:12,color:'#94A3B8' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#64748B' }}>✕</button>
        </div>
        <div style={{ padding:'20px 24px',display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div><label style={lStyle}>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} style={iStyle}/></div>
            <div><label style={lStyle}>Email</label><input value={form.email} onChange={e=>set('email',e.target.value)} style={iStyle}/></div>
            <div><label style={lStyle}>Phone</label><input value={form.phone||''} onChange={e=>set('phone',e.target.value)} style={iStyle}/></div>
            <div><label style={lStyle}>Department</label>
              <select value={form.dept||'Sales'} onChange={e=>set('dept',e.target.value)} style={iStyle}>
                {['Sales','Management','Marketing','Support','Other'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label style={lStyle}>Role</label>
              <select value={form.role} onChange={e=>set('role',e.target.value)} style={iStyle}>
                {Object.entries(ROLE_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lStyle}>Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)} style={iStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end',paddingTop:4 }}>
            <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
            <button onClick={()=>{ onSave(form); onClose(); }} style={{ background:'#6366F1',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer',color:'white' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemoveUserModal({ user, onClose, onConfirm }) {
  const [action, setAction] = useState('deactivate');
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:16,padding:28,maxWidth:420,width:'90%',boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:48,height:48,borderRadius:12,background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        <h3 style={{ textAlign:'center',fontSize:16,fontWeight:700,color:'#0F172A',margin:'0 0 8px' }}>Manage User Access</h3>
        <p style={{ textAlign:'center',fontSize:13,color:'#64748B',margin:'0 0 20px' }}>Choose an action for <strong>{user.name}</strong></p>
        <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:20 }}>
          {[['deactivate','Deactivate Account','Disable login, keep all data intact','#FFFBEB','#F59E0B'],['remove','Remove User','Permanently delete user and unassign leads','#FEF2F2','#EF4444']].map(([val,label,desc,bg,color])=>(
            <div key={val} onClick={()=>setAction(val)} style={{ display:'flex',gap:12,padding:'12px 14px',borderRadius:10,border:`2px solid ${action===val?color:'#E2E8F0'}`,background:action===val?bg:'#fff',cursor:'pointer' }}>
              <div style={{ width:18,height:18,borderRadius:'50%',border:`2px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                {action===val && <div style={{ width:8,height:8,borderRadius:'50%',background:color }}/>}
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:'#0F172A' }}>{label}</div>
                <div style={{ fontSize:11,color:'#94A3B8' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
          <button onClick={onClose} style={{ background:'#F1F5F9',border:'none',borderRadius:8,padding:'8px 20px',fontSize:13,fontWeight:500,cursor:'pointer',color:'#374151' }}>Cancel</button>
          <button onClick={()=>{ onConfirm(user.id, action); onClose(); }} style={{ background: action==='remove'?'#EF4444':'#F59E0B',border:'none',borderRadius:8,padding:'8px 20px',fontSize:13,fontWeight:600,cursor:'pointer',color:'white' }}>
            {action==='remove'?'Remove User':'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [removeUser, setRemoveUser] = useState(null);
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    window.api.users.list()
      .then(us => setUsers(us.map(u => ({ ...u, joined: u.joinedAt }))))
      .catch(err => setErrMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users
    .filter(u => filterRole==='ALL' || u.role===filterRole)
    .filter(u => filterStatus==='ALL' || u.status===filterStatus)
    .filter(u => !search || [u.name,u.email,u.dept||''].join(' ').toLowerCase().includes(search.toLowerCase()));

  const handleInvite = async form => {
    try {
      const u = await window.api.users.create(form);
      setUsers(us => [...us, { ...u, joined: u.joinedAt }]);
    } catch (err) { setErrMsg(err.message); }
  };

  const handleEdit = async form => {
    try {
      const u = await window.api.users.update(form.id, form);
      setUsers(us => us.map(x => x.id === u.id ? { ...u, joined: u.joinedAt } : x));
    } catch (err) { setErrMsg(err.message); }
  };

  const handleRemove = async (id, action) => {
    try {
      if (action === 'remove') {
        await window.api.users.remove(id);
        setUsers(us => us.filter(u => u.id !== id));
      } else {
        const u = await window.api.users.update(id, { status: 'inactive' });
        setUsers(us => us.map(x => x.id === id ? { ...u, joined: u.joinedAt } : x));
      }
    } catch (err) { setErrMsg(err.message); }
  };

  const stats = [
    { label:'Total Users',  value: users.length,                           color:'#6366F1' },
    { label:'Active',       value: users.filter(u=>u.status==='active').length, color:'#10B981' },
    { label:'Admins',       value: users.filter(u=>u.role!=='USER').length, color:'#F59E0B' },
    { label:'LINE Linked',  value: users.filter(u=>u.lineLinked).length,   color:'#4ADE80' },
  ];

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      {/* Modals */}
      {showInvite && <InviteUserModal onClose={()=>setShowInvite(false)} onSave={handleInvite}/>}
      {editUser && <EditUserModal user={editUser} onClose={()=>setEditUser(null)} onSave={handleEdit}/>}
      {removeUser && <RemoveUserModal user={removeUser} onClose={()=>setRemoveUser(null)} onConfirm={handleRemove}/>}

      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700,color:'#0F172A',margin:0 }}>Users & Admin</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:'4px 0 0' }}>{loading ? 'Loading…' : 'Manage team members, roles and access control'}{errMsg && ` · ${errMsg}`}</p>
        </div>
        <button onClick={()=>setShowInvite(true)} style={{ background:'#6366F1',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Invite User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
        {stats.map((s,i)=>(
          <div key={i} style={{ background:'#fff',borderRadius:12,padding:'16px 20px',border:'1px solid #E2E8F0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:28,fontWeight:700,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12,color:'#64748B',marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
        <div style={{ position:'relative',flex:'1',minWidth:200 }}>
          <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94A3B8' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." style={{ width:'100%',padding:'8px 10px 8px 30px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,outline:'none',boxSizing:'border-box' }}/>
        </div>
        <div style={{ display:'flex',gap:4,background:'#F1F5F9',borderRadius:8,padding:4 }}>
          {['ALL','SUPER_ADMIN','ADMIN','USER'].map(r=>(
            <button key={r} onClick={()=>setFilterRole(r)} style={{ background:filterRole===r?'#fff':'transparent',border:'none',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:filterRole===r?600:400,color:filterRole===r?'#0F172A':'#64748B',cursor:'pointer',boxShadow:filterRole===r?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
              {r==='ALL'?'All Roles':ROLE_CFG[r]?.label||r}
            </button>
          ))}
        </div>
        <div style={{ display:'flex',gap:4,background:'#F1F5F9',borderRadius:8,padding:4 }}>
          {['ALL','active','inactive'].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{ background:filterStatus===s?'#fff':'transparent',border:'none',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:filterStatus===s?600:400,color:filterStatus===s?'#0F172A':'#64748B',cursor:'pointer',boxShadow:filterStatus===s?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
              {s==='ALL'?'All Status':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff',borderRadius:12,border:'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
              {['User','Role','Department','Leads','LINE','Status','Joined','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.05em',whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u,i) => {
              const rc = ROLE_CFG[u.role];
              return (
                <tr key={u.id} style={{ borderBottom:'1px solid #F8FAFC' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:34,height:34,borderRadius:'50%',background:`hsl(${u.name.charCodeAt(0)*40%360},55%,65%)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:12,flexShrink:0 }}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600,fontSize:13,color:'#0F172A' }}>{u.name}</div>
                        <div style={{ fontSize:11,color:'#94A3B8' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:rc.bg,color:rc.color,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700 }}>{rc.label}</span>
                  </td>
                  <td style={{ padding:'12px 16px',fontSize:13,color:'#64748B' }}>{u.dept||'—'}</td>
                  <td style={{ padding:'12px 16px',fontSize:13,fontWeight:600,color:'#6366F1' }}>{u.leads||'—'}</td>
                  <td style={{ padding:'12px 16px' }}>
                    {u.lineLinked
                      ? <span style={{ color:'#4ADE80',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="#4ADE80"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Linked</span>
                      : <span style={{ color:'#94A3B8',fontSize:12 }}>Not linked</span>}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:u.status==='active'?'#ECFDF5':u.status==='suspended'?'#FEF2F2':'#F1F5F9',color:u.status==='active'?'#10B981':u.status==='suspended'?'#EF4444':'#94A3B8',borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:600 }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px',fontSize:12,color:'#64748B' }}>{u.joined}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex',gap:4 }}>
                      <button onClick={()=>setEditUser(u)} style={{ background:'#EEF2FF',border:'none',borderRadius:6,padding:'5px 10px',fontSize:11,color:'#6366F1',cursor:'pointer',fontWeight:600 }}>Edit</button>
                      <button onClick={()=>setRemoveUser(u)} style={{ background:'#FEF2F2',border:'none',borderRadius:6,padding:'5px 10px',fontSize:11,color:'#EF4444',cursor:'pointer',fontWeight:600 }}>Remove</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:'48px 24px',textAlign:'center' }}>
            <div style={{ fontSize:13,fontWeight:600,color:'#64748B' }}>No users found</div>
            <div style={{ fontSize:12,color:'#94A3B8',marginTop:4 }}>Try adjusting filters or invite a new user</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LineOAView, UsersView });
