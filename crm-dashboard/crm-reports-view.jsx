
// CRM Reports & Analytics View
const { useState } = React;

function MiniBar({ value, max, color = '#6366F1' }) {
  return (
    <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }}/>
    </div>
  );
}

function HorizBarChart({ data, color = '#6366F1' }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 90, fontSize: 12, color: '#374151', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</div>
          <MiniBar value={d.value} max={max} color={color}/>
          <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{d.value}</div>
          {d.pct !== undefined && <div style={{ width: 38, fontSize: 11, color: '#94A3B8' }}>{d.pct}%</div>}
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, colors = ['#6366F1', '#10B981'], labels = ['New', 'Won'], height = 130 }) {
  const allVals = data.flatMap(d => [d.v1, d.v2]);
  const max = Math.max(...allVals), min = 0;
  const range = max - min || 1;
  const W = 400, H = height;
  const mkPts = key => data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d[key] - min) / range) * (H - 14) - 7;
    return [x, y];
  });
  const pts1 = mkPts('v1'), pts2 = mkPts('v2');
  const line = pts => pts.map(p => p.join(',')).join(' ');
  const area = (pts, col) => {
    const areaPath = `0,${H} ` + pts.map(p => p.join(',')).join(' ') + ` ${W},${H}`;
    return (
      <>
        <defs>
          <linearGradient id={`g-${col.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={col} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={areaPath} fill={`url(#g-${col.replace('#','')})`}/>
        <polyline points={line(pts)} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={col}/>)}
      </>
    );
  };
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {area(pts1, colors[0])}
        {area(pts2, colors[1])}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((d, i) => <span key={i} style={{ fontSize: 9, color: '#94A3B8' }}>{d.label}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 3, borderRadius: 2, background: colors[i] }}/>
            <span style={{ fontSize: 11, color: '#64748B' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesTable({ data }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
            {['Sales Rep', 'Assigned', 'Contacted', 'Won', 'Lost', 'Win Rate', 'Revenue'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${row.name.charCodeAt(0)*40%360},55%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>
                    {row.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{row.name}</span>
                </div>
              </td>
              <td style={{ padding: '10px 12px', color: '#374151' }}>{row.assigned}</td>
              <td style={{ padding: '10px 12px', color: '#374151' }}>{row.contacted}</td>
              <td style={{ padding: '10px 12px' }}><span style={{ color: '#10B981', fontWeight: 700 }}>{row.won}</span></td>
              <td style={{ padding: '10px 12px' }}><span style={{ color: '#EF4444', fontWeight: 600 }}>{row.lost}</span></td>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, maxWidth: 80, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${row.winRate}%`, height: '100%', background: row.winRate >= 25 ? '#10B981' : '#F59E0B', borderRadius: 3 }}/>
                  </div>
                  <span style={{ fontWeight: 700, color: row.winRate >= 25 ? '#10B981' : '#F59E0B', minWidth: 32 }}>{row.winRate}%</span>
                </div>
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#6366F1' }}>{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignTable({ data }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
            {['Campaign', 'Source', 'Leads', 'Qualified', 'Won', 'Conv. Rate', 'Cost/Lead'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{row.name}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#64748B' }}>{row.source}</span>
              </td>
              <td style={{ padding: '10px 12px', color: '#374151' }}>{row.leads}</td>
              <td style={{ padding: '10px 12px', color: '#374151' }}>{row.qualified}</td>
              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10B981' }}>{row.won}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ background: row.conv >= 20 ? '#ECFDF5' : '#FFFBEB', color: row.conv >= 20 ? '#10B981' : '#F59E0B', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{row.conv}%</span>
              </td>
              <td style={{ padding: '10px 12px', color: '#6366F1', fontWeight: 600 }}>฿{row.cpp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsView() {
  const [activeTab, setActiveTab] = useState('daily');
  const [reportPeriod, setReportPeriod] = useState('today');

  const monthlyData = [
    {label:'Jan',v1:120,v2:18},{label:'Feb',v1:145,v2:22},{label:'Mar',v1:132,v2:19},
    {label:'Apr',v1:168,v2:28},{label:'May',v1:190,v2:31},{label:'Jun',v1:175,v2:26},
    {label:'Jul',v1:210,v2:38},{label:'Aug',v1:195,v2:35},{label:'Sep',v1:220,v2:42},
    {label:'Oct',v1:245,v2:48},{label:'Nov',v1:268,v2:52},{label:'Dec',v1:312,v2:58},
  ];

  const sourceData = [
    { label: 'Facebook Ads', value: 320, pct: 25 },
    { label: 'Google Ads',   value: 280, pct: 22 },
    { label: 'LINE Ads',     value: 210, pct: 16 },
    { label: 'Organic',      value: 180, pct: 14 },
    { label: 'Referral',     value: 150, pct: 12 },
    { label: 'Email',        value: 90,  pct: 7  },
    { label: 'Walk-in',      value: 54,  pct: 4  },
  ];

  const salesData = [
    { name: 'John D.',  assigned: 320, contacted: 280, won: 85, lost: 22, winRate: 27, revenue: '฿1.2M' },
    { name: 'Sara K.',  assigned: 285, contacted: 240, won: 72, lost: 18, winRate: 25, revenue: '฿980K' },
    { name: 'Mike T.',  assigned: 248, contacted: 200, won: 54, lost: 28, winRate: 22, revenue: '฿720K' },
    { name: 'Amy R.',   assigned: 198, contacted: 155, won: 26, lost: 21, winRate: 13, revenue: '฿380K' },
  ];

  const campaigns = [
    { name: 'Summer Sale 2026', source: 'Facebook',  leads: 248, qualified: 95, won: 42, conv: 17, cpp: 85  },
    { name: 'Q2 Google Search',  source: 'Google',    leads: 195, qualified: 88, won: 38, conv: 19, cpp: 120 },
    { name: 'LINE OA Blast',     source: 'LINE Ads',  leads: 180, qualified: 72, won: 48, conv: 27, cpp: 55  },
    { name: 'Referral Program',  source: 'Referral',  leads: 150, qualified: 90, won: 52, conv: 35, cpp: 30  },
    { name: 'Email Nurture',     source: 'Email',     leads: 90,  qualified: 40, won: 18, conv: 20, cpp: 25  },
  ];

  const convBySource = [
    { label: 'Referral',  value: 35, pct: 35 },
    { label: 'LINE Ads',  value: 27, pct: 27 },
    { label: 'Email',     value: 20, pct: 20 },
    { label: 'Google',    value: 19, pct: 19 },
    { label: 'Facebook',  value: 17, pct: 17 },
    { label: 'Organic',   value: 12, pct: 12 },
  ];

  const tabs = [
    { id: 'daily',    label: 'Daily Report' },
    { id: 'source',   label: 'Lead Source' },
    { id: 'sales',    label: 'Sales Performance' },
    { id: 'campaign', label: 'Campaigns' },
  ];

  const cardStyle = {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>CRM performance insights · May 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none' }}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button style={{ background: '#4ADE80', color: '#14532D', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V9h12v3zm0-4H6V5h12v3z"/></svg>
            Send to LINE
          </button>
          <button onClick={() => {
            const printWin = window.open('', '_blank');
            const today = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' });
            printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>CRM Report — ${today}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
            <style>
              *{box-sizing:border-box;margin:0;padding:0} body{font-family:'Plus Jakarta Sans',sans-serif;padding:32px;color:#0F172A;font-size:13px}
              h1{font-size:22px;font-weight:700;margin-bottom:4px} .sub{color:#64748B;font-size:12px;margin-bottom:24px}
              .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
              .card{background:#F8FAFC;border-radius:8px;padding:14px;border:1px solid #E2E8F0}
              .card .val{font-size:22px;font-weight:700;margin-bottom:2px} .card .lbl{font-size:10px;color:#64748B}
              table{width:100%;border-collapse:collapse;margin-bottom:24px} th{background:#F8FAFC;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#64748B;border-bottom:2px solid #E2E8F0}
              td{padding:10px 12px;border-bottom:1px solid #F1F5F9;font-size:12px} .badge{border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700}
              h2{font-size:14px;font-weight:700;margin-bottom:12px;padding-top:16px;border-top:1px solid #E2E8F0}
              @media print{body{padding:16px}@page{margin:16mm}}
            </style></head><body>
            <h1>CRM Lead Copilot — Report</h1>
            <div class="sub">${today} · Period: ${reportPeriod}</div>
            <div class="grid">
              <div class="card"><div class="val" style="color:#6366F1">34</div><div class="lbl">New Leads Today</div></div>
              <div class="card"><div class="val" style="color:#EF4444">12</div><div class="lbl">Hot Leads</div></div>
              <div class="card"><div class="val" style="color:#F59E0B">18</div><div class="lbl">Follow-up Due</div></div>
              <div class="card"><div class="val" style="color:#10B981">6</div><div class="lbl">Won Today</div></div>
              <div class="card"><div class="val" style="color:#06B6D4">28</div><div class="lbl">Contacted</div></div>
              <div class="card"><div class="val" style="color:#EF4444">2</div><div class="lbl">Lost Today</div></div>
            </div>
            <h2>Sales Performance</h2>
            <table><thead><tr><th>Sales Rep</th><th>Assigned</th><th>Won</th><th>Win Rate</th><th>Revenue</th></tr></thead><tbody>
              <tr><td>John D.</td><td>320</td><td>85</td><td><span class="badge" style="background:#ECFDF5;color:#10B981">27%</span></td><td style="color:#6366F1;font-weight:700">฿1.2M</td></tr>
              <tr><td>Sara K.</td><td>285</td><td>72</td><td><span class="badge" style="background:#ECFDF5;color:#10B981">25%</span></td><td style="color:#6366F1;font-weight:700">฿980K</td></tr>
              <tr><td>Mike T.</td><td>248</td><td>54</td><td><span class="badge" style="background:#FFFBEB;color:#F59E0B">22%</span></td><td style="color:#6366F1;font-weight:700">฿720K</td></tr>
              <tr><td>Amy R.</td><td>198</td><td>26</td><td><span class="badge" style="background:#FEF2F2;color:#EF4444">13%</span></td><td style="color:#6366F1;font-weight:700">฿380K</td></tr>
            </tbody></table>
            <h2>Lead Sources</h2>
            <table><thead><tr><th>Source</th><th>Leads</th><th>Won</th><th>Conv. Rate</th></tr></thead><tbody>
              <tr><td>Facebook Ads</td><td>320</td><td>42</td><td>17%</td></tr>
              <tr><td>Google Ads</td><td>280</td><td>38</td><td>19%</td></tr>
              <tr><td>LINE Ads</td><td>210</td><td>48</td><td>27%</td></tr>
              <tr><td>Referral</td><td>150</td><td>52</td><td>35%</td></tr>
              <tr><td>Organic</td><td>180</td><td>22</td><td>12%</td></tr>
            </tbody></table>
            <div style="margin-top:24px;padding-top:12px;border-top:1px solid #E2E8F0;font-size:10px;color:#94A3B8;text-align:center">
              Generated by CRM Lead Copilot Dashboard · ${new Date().toLocaleString()}
            </div>
            <script>window.onload=()=>window.print();<\/script>
            </body></html>`);
            printWin.document.close();
          }} style={{ background: '#6366F1', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? '#fff' : 'transparent',
            border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? '#0F172A' : '#64748B',
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Daily Report Tab */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {[
            { label: 'New Today',     value: '34', color: '#6366F1', d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
            { label: 'Contacted',     value: '28', color: '#06B6D4', d: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
            { label: 'Hot Leads',     value: '12', color: '#EF4444', d: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z' },
            { label: 'Follow-up Due', value: '18', color: '#F59E0B', d: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' },
            { label: 'Won Today',     value: '6',  color: '#10B981', d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
            { label: 'Lost Today',    value: '2',  color: '#EF4444', d: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z' },
          ].map((item, i) => (
            <div key={i} style={{ ...cardStyle, padding: '14px 16px' }}>
              <div style={{ width:34,height:34,borderRadius:8,background:item.color+'18',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={item.color}><path d={item.d}/></svg>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#0F172A' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
          </div>

          {/* Monthly trend + by source */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Lead & Won Trend</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Monthly new leads vs won</div>
              <LineChart data={monthlyData} colors={['#6366F1','#10B981']} labels={['New Leads','Won']}/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Today by Source</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Lead acquisition by channel</div>
              <HorizBarChart data={[
                {label:'Facebook',value:12},{label:'Google',value:8},
                {label:'LINE Ads',value:7},{label:'Organic',value:4},{label:'Referral',value:3},
              ]} color="#6366F1"/>
            </div>
          </div>
        </div>
      )}

      {/* Source Tab */}
      {activeTab === 'source' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Leads by Source</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 20 }}>Total lead count per channel</div>
              <HorizBarChart data={sourceData} color="#6366F1"/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Conversion Rate by Source</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 20 }}>% leads converted to won</div>
              <HorizBarChart data={convBySource} color="#10B981"/>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 16 }}>Source Performance Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {sourceData.map((s, i) => (
                <div key={i} style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#6366F1' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>leads total</div>
                  <div style={{ marginTop: 8, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: '#6366F1', borderRadius: 2 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Sales Team Performance</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>All time results per sales representative</div>
            <SalesTable data={salesData}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Won Rate per Rep</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>% of leads won</div>
              <HorizBarChart data={salesData.map(s=>({label:s.name,value:s.winRate,pct:s.winRate}))} color="#10B981"/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Leads Assigned per Rep</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Lead distribution</div>
              <HorizBarChart data={salesData.map(s=>({label:s.name,value:s.assigned}))} color="#8B5CF6"/>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Tab */}
      {activeTab === 'campaign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Campaign Performance</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>All active campaigns · conversion & cost analysis</div>
              </div>
              <button style={{ background: '#EEF2FF', color: '#6366F1', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ New Campaign</button>
            </div>
            <CampaignTable data={campaigns}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Top Campaigns by Conv.</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Sorted by conversion rate</div>
              <HorizBarChart data={campaigns.sort((a,b)=>b.conv-a.conv).map(c=>({label:c.name.substring(0,14),value:c.conv,pct:c.conv}))} color="#F59E0B"/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Cost per Lead</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Lower is better</div>
              <HorizBarChart data={campaigns.sort((a,b)=>b.cpp-a.cpp).map(c=>({label:c.name.substring(0,14),value:c.cpp}))} color="#EF4444"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ReportsView });
