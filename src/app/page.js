import PostCard from '@/components/feed/PostCard';
import CreatePostForm from '@/components/feed/CreatePostForm';
import { createClient } from '@/utils/supabase/server';
import { createPost } from '@/app/actions';
import { redirect } from 'next/navigation';

const MOCK_POSTS = [
  {
    id: 'mock-1',
    author: {
      name: 'Chinedu Okeke',
      initials: 'CO',
      title: 'Senior UI/UX Designer',
      location: 'Lagos, NG'
    },
    time: '2h ago',
    content: 'Just wrapped up a massive redesign for a local fintech app. Emphasizing trust and clarity through minimal interfaces. The Naija tech space is evolving so fast! 🚀',
    image: true,
    imageColor: '#2A2A35',
    likes: 124,
    comments: 18
  },
  {
    id: 'mock-2',
    author: {
      name: 'Aisha Bello',
      initials: 'AB',
      title: 'Brand Strategist & Writer',
      location: 'Abuja, NG'
    },
    time: '5h ago',
    content: 'Storytelling is the heart of African branding. If your brand doesn\'t tell a story that resonates with our culture, it\'s just noise. Wrote a new piece on Substack about this.',
    image: false,
    likes: 89,
    comments: 24
  },
  {
    id: 'mock-3',
    author: {
      name: 'Tobi Awolowo',
      initials: 'TA',
      title: 'Frontend Developer (React/Next.js)',
      location: 'Ibadan, NG'
    },
    time: '1d ago',
    content: 'Finally got the hang of Server Actions in Next.js 14. Building dynamic platforms without writing manual API routes feels like a superpower! 💻🔥',
    image: true,
    imageColor: '#1E1E24',
    likes: 256,
    comments: 42
  }
];

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  let profile = null;
  let userPostCount = 0;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
    
    // Fetch total posts by user
    const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id);
    userPostCount = count || 0;
  }
  
  // Fetch real posts with profile data, likes, and comments
  const { data: livePostsData } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(name, title, location, avatar_url, account_type, state_represented, is_verified),
      likes(user_id),
      comments(*, profiles(name, avatar_url))
    `)
    .order('created_at', { ascending: false });

  // Map real posts to PostCard format
  const livePosts = (livePostsData || []).map(post => {
    const p = post.profiles;
    const authorInitials = p?.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    
    // Sort comments by created_at descending
    const commentsList = (post.comments || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      id: post.id,
      author: {
        id: post.author_id,
        name: p?.name || 'Anonymous User',
        initials: authorInitials,
        title: p?.account_type === 'government' && p?.state_represented ? `${p.state_represented} State Agency` : p?.title || 'Creative',
        location: p?.location || 'Unknown Location',
        accountType: p?.account_type || 'individual',
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

  const allPosts = [...livePosts, ...MOCK_POSTS];

  // Calculate trending hashtags from allPosts content
  const hashtagCounts = {};
  allPosts.forEach(post => {
    if (post.content) {
      const hashtags = post.content.match(/#[\w]+/g);
      if (hashtags) {
        hashtags.forEach(tag => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      }
    }
  });

  const trendingHashtags = Object.keys(hashtagCounts)
    .map(tag => ({ tag, count: hashtagCounts[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

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
          
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Posts Made</span>
              <span style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>{userPostCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Wallet Balance</span>
              <span style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>🪙 {profile?.wallet_balance || 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="feed">
        <CreatePostForm profile={profile} initials={initials} />

        {allPosts.map(post => (
          <PostCard key={post.id} post={post} currentUser={profile} />
        ))}
      </div>

      {/* Right Panel: Trending */}
      <aside className="right-panel">
        <div className="card glass-panel trending">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Trending in Naija</h3>
          
          {trendingHashtags.length > 0 ? (
            trendingHashtags.map((item, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Trending</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, margin: '0.2rem 0' }}>{item.tag}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{item.count} post{item.count !== 1 ? 's' : ''}</p>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No trending topics yet.</p>
          )}
        </div>
      </aside>
    </main>
  );
}
