import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | OrangeLink',
  description: 'Aggregated summaries and platform metrics.',
};

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify Admin Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/'); // Redirect non-admins to home
  }

  // Fetch Aggregated Metrics
  // 1. Total Users & Recent Users
  const { data: allProfiles, count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // 2. Total Organizations
  const totalOrganizations = allProfiles?.filter(p => p.account_type === 'government' || p.account_type === 'institution').length || 0;

  // 3. Total Posts
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  // 4. Economic Impact (Purchases)
  const { data: purchases } = await supabase.from('purchases').select('amount_paid, platform_fee');
  let totalVolume = 0;
  let platformRevenue = 0;
  if (purchases) {
    purchases.forEach(p => {
      totalVolume += Number(p.amount_paid) || 0;
      platformRevenue += Number(p.platform_fee) || 0;
    });
  }

  // 5. Governance & Health
  const { count: totalInitiatives } = await supabase.from('initiatives').select('*', { count: 'exact', head: true });
  const { count: openTickets } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open');

  const recentUsers = allProfiles?.slice(0, 5) || [];

  return (
    <main className="container page-layout" style={{ maxWidth: '1200px' }}>
      {/* Sidebar: Admin Navigation */}
      <aside className="sidebar">
        <div className="card glass-panel profile-summary">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Admin Menu</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ padding: '0.5rem', background: 'rgba(255,107,0,0.1)', color: 'var(--primary-orange)', borderRadius: '4px', fontWeight: 'bold' }}>Dashboard Overview</li>
            <li style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>User Management</li>
            <li style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Dispute Mediation</li>
            <li style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Analytics Reports</li>
          </ul>
        </div>
      </aside>

      {/* Main Dashboard */}
      <div className="feed" style={{ flex: '2.5' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Platform Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Aggregated insights across the Orangeeconomy.ng ecosystem.</p>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-orange)' }}>Economic Impact</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', borderTop: '2px solid var(--primary-orange)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Transaction Volume</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>🪙 {totalVolume}</p>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', borderTop: '2px solid #8B5CF6' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Platform Revenue</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>🪙 {platformRevenue}</p>
          </div>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#10B981' }}>Platform Health & Growth</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalUsers || 0}</p>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Organizations</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalOrganizations}</p>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Initiatives</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalInitiatives || 0}</p>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: openTickets > 0 ? '1px solid #EF4444' : 'none' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Open Tickets</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: openTickets > 0 ? '#EF4444' : 'var(--text-primary)' }}>{openTickets || 0}</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="card glass-panel">
          <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', margin: 0 }}>Recent Signups</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>User</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account Type</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Location/State</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {u.avatar_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={u.avatar_url} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>U</div>
                        )}
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>{u.name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.title || 'Creative'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {u.account_type === 'government' ? (
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>Govt MDA</span>
                      ) : u.account_type === 'institution' ? (
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>Institution</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>Creative</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {u.account_type === 'government' ? u.state_represented || 'N/A' : u.location || 'N/A'}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Right Panel: Admin Alerts */}
      <aside className="right-panel">
        <div className="card glass-panel trending">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>System Alerts</h3>
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10B981', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#10B981' }}>System operating normally. All services are fully functional.</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '4px solid #8B5CF6', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#8B5CF6' }}>New features deployed: Official Agency Accounts.</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
