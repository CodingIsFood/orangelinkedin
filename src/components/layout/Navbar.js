'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signout } from '@/app/auth/actions';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import './navbar.css';

export default function Navbar({ user, isAdmin, walletBalance, unreadNotifications = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [localUnread, setLocalUnread] = useState(unreadNotifications);

  useEffect(() => {
    setLocalUnread(unreadNotifications);
  }, [unreadNotifications]);

  useEffect(() => {
    if (pathname === '/notifications') {
      setLocalUnread(0);
    }
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Tier */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1.5rem' }}>
        <Link href="/" className="logo">
          Orange<span>economy</span>
        </Link>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '400px', margin: '0 2rem' }} className="search-form">
          <input 
            type="text" 
            placeholder="Search creatives, posts, initiatives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1.2rem', borderRadius: '24px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', outline: 'none', fontSize: '0.9rem' }}
          />
        </form>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              <ThemeToggle />
              <Link href="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }} title="Notifications">
                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                {localUnread > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'red', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>
                    {localUnread}
                  </span>
                )}
              </Link>
              <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }} title="Analytics">
                <span style={{ fontSize: '1.2rem' }}>📊</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                  🪙 {walletBalance || 0}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user.user_metadata?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user.user_metadata?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <form action={signout}>
                <button type="submit" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Sign Out</button>
              </form>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login" className="btn btn-primary">Sign In</Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Tier */}
      <div style={{ borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }} className="bottom-tier">
        <div className="container nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '0.5rem 1.5rem', overflowX: 'auto' }}>
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Feed</Link>
          <Link href="/official" className={`nav-link ${pathname === '/official' ? 'active' : ''}`}>Official Updates</Link>
          <Link href="/discover" className={`nav-link ${pathname === '/discover' ? 'active' : ''}`}>Discover</Link>
          <Link href="/initiatives" className={`nav-link ${pathname.startsWith('/initiatives') ? 'active' : ''}`}>Initiatives</Link>
          <Link href="/marketplace" className={`nav-link ${pathname.startsWith('/marketplace') ? 'active' : ''}`}>Marketplace</Link>
          {user && (
            <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}>Profile</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`} style={{ color: 'var(--primary-orange)' }}>Admin</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
