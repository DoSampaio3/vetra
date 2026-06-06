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
  { href: '/settings',  icon: '⊙', label: 'Config.' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const credits = user?.credits ?? 0;
  const isLow = credits <= 1 && credits !== 999;
  const isUnlimited = credits === 999;
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.history.list(1, 5).then(r => setRecent(r.history || [])).catch(() => {});
  }, [user, pathname]);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* SIDEBAR — desktop only */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="text-white font-semibold text-sm">Vetra</span>
          <span className="ml-auto text-[9px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded-full font-mono">
            {user?.plan === 'enterprise' ? 'POWER' : user?.plan === 'premium' ? 'PRO' : 'FREE'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Recentes */}
        {recent.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 px-1">Recentes</p>
            {recent.slice(0,4).map((item:any) => (
              <Link key={item.id} href={item.report_id ? `/report/${item.report_id}` : '/history'}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors">
                <span className="text-xs text-slate-500">
                  {item.query_type==='email'?'✉':item.query_type==='username'?'@':item.query_type==='phone'?'☎':'#'}
                </span>
                <span className="text-xs text-slate-400 truncate flex-1">{item.query_value}</span>
                {item.result_score!=null && (
                  <span className={`text-[10px] font-bold font-mono ${item.result_score>=70?'text-emerald-400':item.result_score>=40?'text-amber-400':'text-red-400'}`}>
                    {item.result_score}
                  </span>
                )}
              </Link>
            ))}
            <Link href="/history" className="block text-[10px] text-blue-500 px-2 mt-1">Ver tudo →</Link>
          </div>
        )}

        {/* Créditos */}
        <div className="p-3 border-t border-slate-800">
          <div className={`rounded-xl p-3 ${isLow ? 'bg-red-900/20 border border-red-800/40' : 'bg-slate-800'}`}>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-400">Consultas</span>
              <span className={`text-xs font-bold font-mono ${isLow ? 'text-red-400' : 'text-white'}`}>
                {isUnlimited ? '∞' : credits}
              </span>
            </div>
            {!isUnlimited && (
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100,(credits/10)*100)}%` }} />
              </div>
            )}
            {isLow && (
              <Link href="/settings"
                className="block w-full text-center text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg py-1.5 font-medium transition-colors">
                Comprar créditos
              </Link>
            )}
          </div>
        </div>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.full_name?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Sair"
              className="text-slate-500 hover:text-white transition-colors text-sm p-1">⇥</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0 h-14 flex items-center px-4 gap-3 z-10">
          {/* Logo mobile */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="text-gray-900 font-bold text-sm">Vetra</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold font-mono border ${
              isLow ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLow?'bg-red-500':'bg-blue-500'}`}/>
              {isUnlimited ? '∞' : credits}
            </div>
            <Link href="/settings"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
              + Comprar
            </Link>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* BOTTOM NAV — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-gray-500">
          <span className="text-lg leading-none">⇥</span>
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
}
