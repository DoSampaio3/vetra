'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/verify', label: 'Nova Verificação' },
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link href="/dashboard" style={styles.logo}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>VETRA</span>
        </Link>

        <div style={styles.links}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                ...styles.link,
                ...(pathname === link.href ? styles.linkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.right}>
          {user && (
            <>
              <span style={styles.userBadge}>
                <span style={styles.dot} />
                {user.full_name.split(' ')[0]}
                {user.plan === 'premium' && (
                  <span style={styles.planBadge}>PRO</span>
                )}
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8, 12, 15, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    height: '60px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoMark: {
    fontSize: '20px',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 500,
    letterSpacing: '0.15em',
    color: 'var(--text)',
  },
  links: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  link: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  linkActive: {
    color: 'var(--text)',
    background: 'var(--bg-card)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--green)',
  },
  planBadge: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--accent)',
    background: 'rgba(99, 179, 237, 0.1)',
    padding: '2px 5px',
    borderRadius: '3px',
    border: '1px solid rgba(99, 179, 237, 0.2)',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.2s',
  },
};
