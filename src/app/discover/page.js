import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { startConversation } from '@/app/messages/actions';
import PostCard from '@/components/feed/PostCard';

const DISCOVER_PROFILES = [
  {
    id: 1,
    name: 'Adaeze Nnamdi',
    role: 'Creative Director',
    location: 'Lagos',
    avatarColor: '#FF6B00',
    skills: ['Branding', 'UI/UX', 'Art Direction']
  },
  {
    id: 2,
    name: 'Samuel Ojo',
    role: 'Fullstack Developer',
    location: 'Abuja',
    avatarColor: '#2563EB',
    skills: ['React', 'Node.js', 'Web3']
  },
  {
    id: 3,
    name: 'Kemi Adebayo',
    role: 'Fashion Photographer',
    location: 'Port Harcourt',
    avatarColor: '#10B981',
    skills: ['Portrait', 'Editorial', 'Retouching']
  },
  {
    id: 4,
    name: 'Ikenna Okafor',
    role: 'Motion Designer',
    location: 'Lagos',
    avatarColor: '#8B5CF6',
    skills: ['After Effects', 'Cinema 4D', '3D Animation']
  }
];

export default async function Discover({ searchParams }) {
  const supabase = createClient();
  const query = searchParams?.q || '';
  const category = searchParams?.category || '';
  const { data: { user } } = await supabase.auth.getUser();

  let currentUserProfile = null;
  if (user) {
     const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
     currentUserProfile = data;
  }
  
  let dbQuery = supabase.from('profiles').select('*');
  let posts = [];
  
  if (category) {
    if (category === 'agency') {
      dbQuery = dbQuery.in('account_type', ['agency', 'government']);
    } else {
      dbQuery = dbQuery.ilike('title', `%${category}%`);
    }
  }
  
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,title.ilike.%${query}%,bio.ilike.%${query}%`);
    
    // Search posts
    const { data: searchedPosts } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(name, title, location, avatar_url, account_type, state_represented, is_verified),
        likes(user_id),
        comments(*, profiles(name, avatar_url))
      `)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });

    posts = (searchedPosts || []).map(post => {
      const p = post.profiles;
      const authorInitials = p?.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
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
        time: new Date(post.created_at).toLocaleDateString(),
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
  }
  
  const { data: profilesData } = await dbQuery;
  
  const realProfiles = (profilesData || []).map(p => ({
    id: p.id,
    name: p.name || 'Anonymous User',
    role: p.account_type === 'agency' && p.state_represented ? `${p.state_represented} State Agency` : p.title || 'Creative',
    location: p.location || 'Unknown Location',
    avatarColor: '#333',
    avatarUrl: p.avatar_url,
    accountType: p.account_type || 'individual',
    stateRepresented: p.state_represented || null,
    skills: ['Creative'] // Default placeholder skill for real users
  }));

  let filteredMockProfiles = DISCOVER_PROFILES;
  if (category) {
    filteredMockProfiles = DISCOVER_PROFILES.filter(p => {
      if (category === 'agency') return false;
      return p.role.toLowerCase().includes(category.toLowerCase());
    });
  }

  // Only show mock profiles if no search query is active
  const allProfiles = query ? realProfiles : [...realProfiles, ...filteredMockProfiles];

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {query ? `Search Results for "${query}"` : 'Discover Naija Creatives'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {query ? `Found ${allProfiles.length} profiles matching your search.` : 'Find the best talent across Nigeria for your next big project.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/discover" className={`btn ${!category && !query ? 'btn-primary' : 'btn-outline'}`}>All Roles</Link>
        <Link href="/discover?category=agency" className={`btn ${category === 'agency' ? 'btn-primary' : 'btn-outline'}`}>State Agencies</Link>
        <Link href="/discover?category=designer" className={`btn ${category === 'designer' ? 'btn-primary' : 'btn-outline'}`}>Designers</Link>
        <Link href="/discover?category=developer" className={`btn ${category === 'developer' ? 'btn-primary' : 'btn-outline'}`}>Developers</Link>
        <Link href="/discover?category=photographer" className={`btn ${category === 'photographer' ? 'btn-primary' : 'btn-outline'}`}>Photographers</Link>
        <Link href="/discover?category=writer" className={`btn ${category === 'writer' ? 'btn-primary' : 'btn-outline'}`}>Writers</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {allProfiles.map(profile => (
          <div key={profile.id} className="card glass-panel" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            {profile.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                  margin: '0 auto 1rem auto', display: 'block', border: '3px solid var(--background)'
                }} 
              />
            ) : (
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: profile.avatarColor || '#333', 
                  margin: '0 auto 1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            <h3 style={{ marginBottom: '0.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              {profile.name}
              {profile.accountType === 'agency' && (
                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>✓ Official</span>
              )}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{profile.role}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>📍 {profile.location}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {profile.skills.map(skill => (
                <span key={skill} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  {skill}
                </span>
              ))}
            </div>

            {typeof profile.id === 'string' ? (
              <form action={startConversation.bind(null, profile.id)}>
                <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>Message</button>
              </form>
            ) : (
              <button className="btn btn-outline" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} title="Mock Profile">Message</button>
            )}
          </div>
        ))}
      </div>

      {query && posts.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Matching Posts</h2>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={currentUserProfile} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
