import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { startConversation } from '@/app/messages/actions';

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, title')
    .eq('id', params.id)
    .single();

  if (!profile) return { title: 'User Not Found | Orangeeconomy.ng' };

  return {
    title: `${profile.name} | Orangeeconomy.ng`,
    description: `View ${profile.name}'s professional portfolio and listed products.`,
  };
}

export default async function PublicProfilePage({ params }) {
  const supabase = createClient();
  const userId = params.id;

  // Check if viewing own profile, but we'll let it render as public anyway
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Increment view counter if it's not the user's own profile
  if (!currentUser || currentUser.id !== userId) {
    const { data: currentProfile } = await supabase.from('profiles').select('views').eq('id', userId).single();
    if (currentProfile) {
      await supabase.from('profiles').update({ views: (currentProfile.views || 0) + 1 }).eq('id', userId);
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  // Generate initials if avatar_url isn't set
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  const isGovernment = profile.account_type === 'government';
  const isInstitution = profile.account_type === 'institution';

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh', maxWidth: '900px' }}>
      
      {/* Hero Cover */}
      <div className="glass-panel" style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ height: '200px', background: 'linear-gradient(45deg, var(--primary-orange), #ff4500, #ff8533)' }}></div>
        
        <div style={{ padding: '0 2rem 2rem 2rem', position: 'relative' }}>
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              style={{ 
                width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover',
                border: '6px solid var(--background)', marginTop: '-60px', marginBottom: '1rem',
                background: 'var(--background)'
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: '120px', height: '120px', borderRadius: '50%', background: '#2A2A35', 
                border: '6px solid var(--background)', marginTop: '-60px', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)'
              }}
            >
              {initials}
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {profile.name || 'Anonymous User'}
                {isGovernment && (
                  <span style={{ fontSize: '1rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>✓ Government MDA</span>
                )}
                {isInstitution && (
                  <span style={{ fontSize: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>🏛️ Institution</span>
                )}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {isGovernment && profile.state_represented ? `${profile.state_represented} State Agency` : profile.title || (isInstitution ? 'Organization' : 'Creative Explorer')}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {profile.location || 'Location not specified'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentUser?.id !== userId && (
                <form action={startConversation.bind(null, userId)}>
                  <button type="submit" className="btn btn-primary">Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: About */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>About</h3>
            <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {profile.bio || "This user hasn't added a bio yet."}
            </p>
          </div>
        </div>

        {/* Right Column: Portfolio / Storefront */}
        <div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{isGovernment || isInstitution ? 'Official Storefront' : 'Storefront'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products?.map(product => (
                <Link href={`/marketplace/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ 
                    background: '#2A2A35', 
                    height: '160px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-end', 
                    padding: '1rem', 
                    backgroundImage: product.cover_image_url ? `url(${product.cover_image_url})` : 'none', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center'
                  }}>
                    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '500', display: 'block', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-orange)' }}>🪙 {product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {(!products || products.length === 0) && (
                <p style={{ color: 'var(--text-muted)' }}>No products listed yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
