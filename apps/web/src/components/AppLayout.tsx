'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/verify',    icon: '⊕', label: 'Nova Consulta' },
  { href: '/history',   icon: '◷', label: 'Histórico' },
  { href: '/settings',  icon: '⊙', label: 'Configurações' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const credits = user?.credits ?? 0;
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.history.list(1, 5)
      .then(res => setRecentHistory(res.history || []))
      .catch(() => {});
  }, [user, pathname]); // re-fetch ao navegar
  const isLowCredits = credits <= 1 && credits !== 999;
  const isUnlimited = credits === 999;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, borderRight: '1px solid #1e293b',
      }} className="hidden md:flex">

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#1d4ed8,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>V</span>
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '14px', letterSpacing: '0.03em' }}>Vetra</span>
          <span style={{ marginLeft: 'auto', fontSize: '9px', background: 'rgba(37,99,235,0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '100px', fontFamily: 'monospace', flexShrink: 0 }}>
            {user?.plan === 'enterprise' ? 'POWER' : user?.plan === 'premium' ? 'PRO' : 'FREE'}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: active ? '#2563EB' : 'transparent',
                color: active ? 'white' : '#94a3b8',
              }}>
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Histórico recente */}
        {recentHistory.length > 0 && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid #1e293b' }}>
            <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px', padding: '0 4px' }}>
              Recentes
            </p>
            {recentHistory.slice(0, 4).map((item: any) => (
              <Link key={item.id} href={item.report_id ? `/report/${item.report_id}` : '/history'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px', borderRadius: '6px', marginBottom: '1px',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>
                  {item.query_type === 'email' ? '✉' : item.query_type === 'username' ? '@' : item.query_type === 'phone' ? '☎' : '#'}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {item.query_value}
                </span>
                {item.result_score != null && (
                  <span style={{ fontSize: '10px', color: item.result_score >= 70 ? '#34d399' : item.result_score >= 40 ? '#fbbf24' : '#f87171', fontFamily: 'monospace', flexShrink: 0, fontWeight: 700 }}>
                    {item.result_score}
                  </span>
                )}
              </Link>
            ))}
            <Link href="/history" style={{ display: 'block', fontSize: '10px', color: '#3b82f6', padding: '4px 8px', textDecoration: 'none', marginTop: '2px' }}>
              Ver tudo →
            </Link>
          </div>
        )}

        {/* Credits */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b' }}>
          <div style={{
            borderRadius: '10px', padding: '12px',
            background: isLowCredits ? 'rgba(239,68,68,0.1)' : '#1e293b',
            border: isLowCredits ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Consultas</span>
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: isLowCredits ? '#f87171' : 'white' }}>
                {isUnlimited ? '∞' : credits}
              </span>
            </div>
            {!isUnlimited && (
              <div style={{ height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: isLowCredits ? '#ef4444' : '#2563EB',
                  width: `${Math.min(100, (credits / 10) * 100)}%`,
                  transition: 'width 0.5s',
                }} />
              </div>
            )}
            {isLowCredits && (
              <Link href="/settings" style={{
                display: 'block', textAlign: 'center', fontSize: '11px',
                background: '#ef4444', color: 'white', borderRadius: '6px',
                padding: '6px', fontWeight: 600, textDecoration: 'none',
              }}>
                Comprar créditos
              </Link>
            )}
          </div>
        </div>

        {/* User + logout */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#2563EB', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', color: 'white', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name?.split(' ')[0]}
              </p>
              <p style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
            >
              ⇥
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          background: 'white', borderBottom: '1px solid #E5E7EB',
          flexShrink: 0, height: '56px', display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: '12px',
        }}>
          <div style={{ flex: 1, maxWidth: '360px' }} className="hidden md:block">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '13px' }}>🔍</span>
              <input
                type="search"
                placeholder="Buscar por nome, username..."
                style={{
                  width: '100%', paddingLeft: '34px', paddingRight: '12px',
                  paddingTop: '8px', paddingBottom: '8px',
                  fontSize: '13px', background: '#F9FAFB',
                  border: '1px solid #E5E7EB', borderRadius: '8px',
                  outline: 'none', color: '#111827',
                }}
                onKeyDown={e => { if (e.key === 'Enter') router.push('/verify'); }}
              />
            </div>
          </div>
          {/* Mobile: logo + credits */}
          <div className="flex md:hidden items-center gap-2 flex-1">
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg,#1d4ed8,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>V</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Vetra</span>
            <div style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
              background: isLowCredits ? '#FEF2F2' : '#EFF6FF',
              color: isLowCredits ? '#dc2626' : '#2563EB',
              border: `1px solid ${isLowCredits ? '#fecaca' : '#bfdbfe'}`,
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isLowCredits ? '#ef4444' : '#3b82f6' }} />
              {isUnlimited ? '∞' : `${credits} crédito${credits !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Credits badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
              background: isLowCredits ? '#FEF2F2' : '#EFF6FF',
              color: isLowCredits ? '#dc2626' : '#2563EB',
              border: `1px solid ${isLowCredits ? '#fecaca' : '#bfdbfe'}`,
              fontFamily: 'monospace',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLowCredits ? '#ef4444' : '#3b82f6' }} />
              {isUnlimited ? '∞ ilimitado' : `${credits} consulta${credits !== 1 ? 's' : ''}`}
            </div>

            <Link href="/settings" style={{
              padding: '6px 14px', background: '#2563EB', color: 'white',
              borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              textDecoration: 'none',
            }}>
              + Comprar
            </Link>

            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#2563EB', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="p-4 md:p-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: '1px solid #E5E7EB',
        display: 'flex', zIndex: 40,
      }} className="md:hidden">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '3px', padding: '10px 0',
              fontSize: '10px', fontWeight: 500, textDecoration: 'none',
              color: active ? '#2563EB' : '#9CA3AF',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '3px', padding: '10px 0',
          fontSize: '10px', fontWeight: 500, background: 'none',
          border: 'none', cursor: 'pointer', color: '#9CA3AF',
        }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>⇥</span>
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
}
