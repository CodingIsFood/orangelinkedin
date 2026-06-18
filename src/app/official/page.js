import PostCard from '@/components/feed/PostCard';
import CreatePostForm from '@/components/feed/CreatePostForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default async function OfficialFeed() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }
  
  // Fetch real posts exclusively from official state agencies, institutions, and government
  // We use inner join to filter posts where the author is an official account
  const { data: livePostsData } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!inner(name, title, location, avatar_url, account_type, state_represented, is_verified),
      likes(user_id),
      comments(*, profiles(name, avatar_url))
    `)
    .in('profiles.account_type', ['agency', 'institution', 'government'])
    .order('created_at', { ascending: false });

  // Map real posts to PostCard format
  const officialPosts = (livePostsData || []).map(post => {
    const p = post.profiles;
    const authorInitials = p?.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    
    const commentsList = (post.comments || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      id: post.id,
      author: {
        name: p?.name || 'Anonymous Account',
        initials: authorInitials,
        title: p?.state_represented ? `${p.state_represented} State Account` : p?.title || 'Official Account',
        location: p?.location || 'Unknown Location',
        accountType: p?.account_type || 'government',
        stateRepresented: p?.state_represented || null,
        isVerified: p?.is_verified || false
      },
      time: formatTimeAgo(post.created_at),
      content: post.content,
      image: !!post.image_url || !!post.image_color,
      imageUrl: post.image_url,
      imageColor: post.image_color,
      likes: post.likes ? post.likes.length : 0,
      userHasLiked: user ? (post.likes || []).some(like => like.user_id === user.id) : false,
      comments: commentsList.length,
      commentsList: commentsList
    };
  });

  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  return (
    <main className="container page-layout">
      {/* Sidebar: Profile Summary */}
      <aside className="sidebar">
        <div className="card glass-panel profile-summary">
          <div className="profile-cover" style={{ height: '80px', background: 'var(--primary-orange)', borderRadius: '8px 8px 0 0', margin: '-1.5rem -1.5rem 1rem -1.5rem' }}></div>
          {profile?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.avatar_url} alt="Avatar" className="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--background)', margin: '-3rem auto 1rem auto', display: 'block', position: 'relative', zIndex: 1 }} />
          ) : (
            <div className="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#333', border: '4px solid var(--background)', margin: '-3rem auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>{profile ? initials : 'GU'}</div>
          )}
          <h3 style={{ textAlign: 'center', marginBottom: '0.2rem' }}>{profile?.name || 'Guest User'}</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{profile?.title || 'Creative Explorer'}</p>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="feed">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>✓</span> 
            Official Updates
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Stay informed with the latest news, events, and opportunities directly from verified government agencies and institutions.</p>
        </div>

        {['agency', 'institution', 'government'].includes(profile?.account_type) && (
          <CreatePostForm profile={profile} initials={initials} />
        )}

        {officialPosts.length > 0 ? (
          officialPosts.map(post => (
            <PostCard key={post.id} post={post} currentUser={profile} />
          ))
        ) : (
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>No official updates yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later for announcements from official accounts.</p>
          </div>
        )}
      </div>

      {/* Right Panel: Info */}
      <aside className="right-panel">
        <div className="card glass-panel trending">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>About Official Updates</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            This feed contains posts from verified government agencies, institutions, and innovation hubs.
          </p>
        </div>
      </aside>
    </main>
  );
}
