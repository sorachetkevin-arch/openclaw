
// CRM Main Dashboard View — KPI cards + charts
const { useState, useEffect } = React;

// Solid icon set
function SolidIcon({ d, size=16, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d={d}/></svg>;
}
const ICONS = {
  users:    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  plus:     "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  calendar: "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  chart:    "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  check:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  xcircle:  "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
  money:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z",
  flame:    "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z",
  bell:     "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
};

// Stat card icon wrapper
function KpiIcon({ name, color }) {
  return (
    <div style={{ width:36,height:36,borderRadius:8,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <SolidIcon d={ICONS[name]} size={18} color={color}/>
    </div>
  );
}
function Sparkline({ data, color = '#6366F1', height = 32, width = 80 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Bar chart component
function BarChart({ data, color = '#6366F1', height = 120 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', height: (d.value / max) * (height - 24),
            background: color, borderRadius: '4px 4px 0 0', opacity: 0.85,
            minHeight: 4, transition: 'height 0.4s ease',
          }}/>
          <span style={{ fontSize: 9, color: '#94A3B8', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart
function DonutChart({ segments, size = 80 }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const r = 28, cx = 40, cy = 40;
  const circles = segments.map((seg, i) => {
    const pct = seg.value / total;
    const offset = cum;
    cum += pct;
    const circumference = 2 * Math.PI * r;
    return (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none"
        stroke={seg.color} strokeWidth="10"
        strokeDasharray={`${pct * circumference} ${circumference}`}
        strokeDashoffset={-offset * circumference}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  });
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth="10"/>
      {circles}
    </svg>
  );
}

// Stat card
function StatCard({ label, value, subLabel, change, color, sparkData, icon, large }) {
  const positive = change >= 0;
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: large ? '20px 24px' : '16px 20px',
      border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: large ? 32 : 26, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{value}</div>
          {subLabel && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{subLabel}</div>}
        </div>
        <KpiIcon name={icon} color={color}/>
      </div>
      {sparkData && <Sparkline data={sparkData} color={color} />}
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: positive ? '#10B981' : '#EF4444', fontWeight: 600 }}>
            {positive ? '▲' : '▼'} {Math.abs(change)}%
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>vs last week</span>
        </div>
      )}
    </div>
  );
}

// Hot leads list
function HotLeadsList({ leads }) {
  const scoreColor = s => s >= 80 ? '#EF4444' : s >= 50 ? '#F59E0B' : '#64748B';
  const scoreLabel = s => s >= 80 ? 'HOT' : s >= 50 ? 'WARM' : 'COLD';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {leads.map((lead, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: i < leads.length - 1 ? '1px solid #F1F5F9' : 'none',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `hsl(${(lead.name.charCodeAt(0) * 37) % 360},60%,65%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            {lead.name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{lead.source} · {lead.company}</div>
          </div>
          <div style={{
            background: scoreColor(lead.score) + '18', color: scoreColor(lead.score),
            borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700,
          }}>{scoreLabel(lead.score)} {lead.score}</div>
        </div>
      ))}
    </div>
  );
}

// Follow-up list
function FollowUpList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: item.overdue ? '#EF4444' : '#F59E0B',
          }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{item.assignee}</div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: item.overdue ? '#EF4444' : '#F59E0B',
          }}>
            {item.overdue ? 'Overdue' : item.time}
          </div>
        </div>
      ))}
    </div>
  );
}

// Line area chart
function LineAreaChart({ data, color = '#6366F1', height = 100 }) {
  const vals = data.map(d => d.value);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const W = 300, H = height;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 10) - 5;
    return [x, y];
  });
  const linePts = pts.map(p => p.join(',')).join(' ');
  const areaPts = `0,${H} ` + linePts + ` ${W},${H}`;
  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={areaPts} fill={`url(#grad-${color.replace('#','')})`}/>
        <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: '#94A3B8' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function MainDashboard({ onNavigate }) {
  const kpiData = [
    { label: 'Total Leads',      value: '1,284', subLabel: 'All time',     change: 12.4,  color: '#6366F1', icon: 'users',    sparkData: [30,45,38,52,61,58,72,68,80,75,90,95] },
    { label: 'New Today',        value: '34',    subLabel: 'May 12, 2026', change: 8.2,   color: '#06B6D4', icon: 'plus',     sparkData: [12,18,15,22,19,28,24,30,28,32,29,34] },
    { label: 'This Month',       value: '312',   subLabel: 'May 2026',     change: 5.7,   color: '#8B5CF6', icon: 'calendar', sparkData: [180,195,210,230,240,255,265,280,290,300,308,312] },
    { label: 'Conversion Rate',  value: '18.4%', subLabel: 'Won / Total',  change: -2.1,  color: '#F59E0B', icon: 'chart',    sparkData: [20,22,19,21,18,17,19,18,20,19,18,18.4] },
    { label: 'Won Leads',        value: '237',   subLabel: 'All time',     change: 14.3,  color: '#10B981', icon: 'check',    sparkData: [80,95,110,120,140,155,165,180,195,210,225,237] },
    { label: 'Lost Leads',       value: '89',    subLabel: 'All time',     change: -3.5,  color: '#EF4444', icon: 'xcircle',  sparkData: [40,45,50,55,60,62,65,70,75,80,85,89] },
    { label: 'Revenue Forecast', value: '฿4.2M', subLabel: 'Pipeline value',change: 22.1, color: '#F59E0B', icon: 'money',    sparkData: [1.5,1.8,2.1,2.4,2.8,3.0,3.2,3.5,3.7,3.9,4.1,4.2] },
    { label: 'Hot Leads',        value: '47',    subLabel: 'Score ≥80',    change: 18.0,  color: '#EF4444', icon: 'flame',    sparkData: [15,18,22,25,28,30,32,35,38,42,45,47] },
    { label: 'Follow-up Today',  value: '18',    subLabel: 'Due tasks',    change: 0,     color: '#F59E0B', icon: 'bell',     sparkData: [10,12,15,13,16,14,18,15,17,16,19,18] },
  ];

  const leadsOverTime = [
    {label:'1',value:28},{label:'5',value:35},{label:'10',value:42},{label:'15',value:38},
    {label:'20',value:55},{label:'25',value:61},{label:'30',value:58},{label:'35',value:72},
    {label:'40',value:68},{label:'45',value:80},{label:'50',value:85},{label:'55',value:90},
  ];

  const sourceData = [
    {label:'FB',value:320},{label:'Google',value:280},{label:'LINE',value:210},{label:'Organic',value:180},{label:'Ref',value:120},{label:'Email',value:90},{label:'Walk-in',value:84},
  ];

  const hotLeads = [
    { name: 'สมชาย ใจดี', source: 'Facebook Ads', company: 'ABC Corp', score: 95 },
    { name: 'Natthawut K.', source: 'Google Ads', company: 'XYZ Ltd', score: 88 },
    { name: 'วิภา แสนดี', source: 'LINE Ads', company: 'DEF Co', score: 84 },
    { name: 'Priya Sharma', source: 'Referral', company: 'GHI Inc', score: 82 },
    { name: 'มานะ รักดี', source: 'Facebook Ads', company: 'JKL Pvt', score: 80 },
  ];

  const followUps = [
    { name: 'สมชาย ใจดี', assignee: 'Sales: John D.', time: '10:00', overdue: false },
    { name: 'วิภา แสนดี', assignee: 'Sales: Sara K.', time: '11:30', overdue: false },
    { name: 'Priya Sharma', assignee: 'Sales: Mike T.', time: '09:00', overdue: true },
    { name: 'มานะ รักดี', assignee: 'Sales: John D.', time: '14:00', overdue: false },
    { name: 'Anon Lee', assignee: 'Sales: Sara K.', time: '08:30', overdue: true },
  ];

  const pipelineStages = [
    { label: 'NEW', count: 312, value: '฿2.1M', color: '#6366F1' },
    { label: 'CONTACTED', count: 215, value: '฿1.4M', color: '#06B6D4' },
    { label: 'QUALIFIED', count: 148, value: '฿980K', color: '#8B5CF6' },
    { label: 'PROPOSAL', count: 89, value: '฿640K', color: '#F59E0B' },
    { label: 'WON', count: 237, value: '฿1.8M', color: '#10B981' },
    { label: 'LOST', count: 89, value: '-', color: '#EF4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>Dashboard Overview</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>Monday, 12 May 2026 · Real-time CRM data</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onNavigate('leads')} style={{
            background: '#6366F1', color: 'white', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>+</span> New Lead
          </button>
          <button style={{
            background: '#fff', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 8,
            padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Export</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {kpiData.map((kpi, i) => <StatCard key={i} {...kpi}/>)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Leads over time */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Leads Over Time</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Last 12 months</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['1W','1M','3M','1Y'].map(t => (
                <button key={t} style={{
                  background: t === '1Y' ? '#6366F1' : 'transparent',
                  color: t === '1Y' ? 'white' : '#94A3B8',
                  border: '1px solid ' + (t === '1Y' ? '#6366F1' : '#E2E8F0'),
                  borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <LineAreaChart data={leadsOverTime} color="#6366F1" height={110}/>
        </div>

        {/* Source donut */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>Lead Sources</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>by channel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DonutChart size={90} segments={[
              { value: 320, color: '#6366F1' }, { value: 280, color: '#06B6D4' },
              { value: 210, color: '#4ADE80' }, { value: 180, color: '#F59E0B' }, { value: 294, color: '#E2E8F0' },
            ]}/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['Facebook', 320, '#6366F1'], ['Google', 280, '#06B6D4'], ['LINE', 210, '#4ADE80'], ['Organic', 180, '#F59E0B'], ['Other', 294, '#94A3B8']].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: '#64748B', flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0F172A' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source bar + Hot leads + Follow-up */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Source bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>By Source</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Lead count per channel</div>
          <BarChart data={sourceData} color="#6366F1" height={130}/>
        </div>

        {/* Hot leads */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Hot Leads</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Score ≥ 80</div>
            </div>
            <button onClick={() => onNavigate('leads')} style={{ fontSize: 11, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all</button>
          </div>
          <HotLeadsList leads={hotLeads}/>
        </div>

        {/* Follow-up */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Follow-up Today</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>18 tasks due</div>
            </div>
            <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 12, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>2 Overdue</span>
          </div>
          <FollowUpList items={followUps}/>
        </div>
      </div>

      {/* Pipeline snapshot */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Pipeline Snapshot</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Lead count & value per stage</div>
          </div>
          <button onClick={() => onNavigate('pipeline')} style={{
            background: '#F1F5F9', color: '#374151', border: '1px solid #E2E8F0', borderRadius: 8,
            padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>Open Pipeline →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {pipelineStages.map((stage, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: stage.color }}/>
              <div style={{ fontSize: 10, fontWeight: 700, color: stage.color }}>{stage.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{stage.count}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{stage.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MainDashboard });
