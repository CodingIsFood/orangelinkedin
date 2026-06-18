import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id(name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  const getHref = (notif) => {
    switch(notif.type) {
      case 'message': return `/messages?id=${notif.reference_id}`;
      case 'like':
      case 'comment': return `/#post-${notif.reference_id}`;
      case 'system': return `/offers`;
      default: return '#';
    }
  };

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Notifications</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications?.length > 0 ? (
          notifications.map(notif => (
            <Link key={notif.id} href={getHref(notif)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: notif.is_read ? 0.7 : 1, transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.05)' } }}>
              {notif.actor?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={notif.actor.avatar_url} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                  {notif.actor?.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  <strong>{notif.actor?.name || 'Someone'}</strong>
                  {notif.type === 'like' && ' liked your post.'}
                  {notif.type === 'comment' && ' commented on your post.'}
                  {notif.type === 'message' && ' sent you a message.'}
                  {notif.type === 'system' && ' sent a system notification.'}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
              </div>
            </Link>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>You have no notifications.</p>
        )}
      </div>
    </main>
  );
}
