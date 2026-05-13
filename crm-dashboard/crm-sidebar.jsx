
// CRM Sidebar Navigation Component
const { useState } = React;

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
      </svg>
    )
  },
  {
    id: 'leads', label: 'Leads', badge: 24, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    )
  },
  {
    id: 'pipeline', label: 'Pipeline', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/>
      </svg>
    )
  },
  {
    id: 'campaigns', label: 'Campaigns', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    )
  },
  {
    id: 'reports', label: 'Reports', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9h2v9H5V9zm4-5h2v14H9V4zm4 7h2v7h-2v-7zm4-4h2v11h-2V7z"/>
      </svg>
    )
  },
  {
    id: 'users', label: 'Users', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  },
  {
    id: 'line-oa', label: 'LINE OA', accent: true, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V9h12v3zm0-4H6V5h12v3z"/>
      </svg>
    )
  },
  {
    id: 'settings', label: 'Settings', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.27.07-.55.07-.83s-.03-.57-.07-.84l1.84-1.44c.17-.13.21-.37.1-.55l-1.75-3.03c-.11-.19-.34-.25-.54-.19l-2.17.87c-.46-.35-.95-.64-1.47-.86l-.33-2.3c-.04-.21-.22-.37-.44-.37h-3.5c-.22 0-.4.16-.44.37l-.33 2.3c-.52.22-1.01.51-1.47.86l-2.17-.87c-.2-.07-.43 0-.54.19L3.71 9.66c-.11.18-.07.42.1.55l1.84 1.44c-.04.27-.07.56-.07.84s.03.56.07.83l-1.84 1.44c-.17.13-.21.37-.1.55l1.75 3.03c.11.19.34.25.54.19l2.17-.87c.46.35.95.64 1.47.86l.33 2.3c.04.21.22.37.44.37h3.5c.22 0 .4-.16.44-.37l.33-2.3c.52-.22 1.01-.51 1.47-.86l2.17.87c.2.07.43 0 .54-.19l1.75-3.03c.11-.18.07-.42-.1-.55l-1.84-1.44zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
      </svg>
    )
  },
];

function Sidebar({ activePage, onNavigate, collapsed, onToggle, currentUser }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>CRM Lead</div>
            <div style={{ color: '#94A3B8', fontSize: 10 }}>Copilot Dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              background: isActive
                ? 'rgba(99, 102, 241, 0.2)'
                : 'transparent',
              color: isActive ? '#A5B4FC' : (item.accent ? '#4ADE80' : '#94A3B8'),
              transition: 'all 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 2px 2px 0', background: '#6366F1',
                }}/>
              )}
              {item.icon}
              {!collapsed && (
                <>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      background: '#EF4444', color: 'white',
                      borderRadius: 10, fontSize: 10, fontWeight: 700,
                      padding: '1px 6px', minWidth: 18, textAlign: 'center',
                    }}>{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0,
        }}>
          {currentUser?.initials || 'SA'}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Super Admin'}
            </div>
            <div style={{ color: '#64748B', fontSize: 10 }}>{currentUser?.role || 'SUPER_ADMIN'}</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={onToggle} style={{
        position: 'absolute', top: 22, right: -12,
        width: 24, height: 24, borderRadius: '50%',
        background: '#1E293B', border: '1px solid #334155',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94A3B8', padding: 0,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {collapsed
            ? <><polyline points="9 18 15 12 9 6"/></>
            : <><polyline points="15 18 9 12 15 6"/></>
          }
        </svg>
      </button>
    </aside>
  );
}

Object.assign(window, { Sidebar });
