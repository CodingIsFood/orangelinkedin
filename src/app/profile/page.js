import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Profile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: myProducts } = await supabase
    .from('products')
    .select('*')
    .eq('creator_id', user.id);

  const { data: myPurchases } = await supabase
    .from('purchases')
    .select('*, products(*)')
    .eq('buyer_id', user.id);

  const { data: mySales } = await supabase
    .from('purchases')
    .select('amount_paid, platform_fee')
    .eq('seller_id', user.id);

  let totalRevenue = 0;
  if (mySales) {
    mySales.forEach(sale => {
      totalRevenue += (Number(sale.amount_paid) - Number(sale.platform_fee));
    });
  }

  if (!profile) {
    return (
      <main className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
        <h1>Profile not found</h1>
        <p>There was an error loading your profile.</p>
      </main>
    );
  }

  // Generate initials if avatar_url isn't set
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

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
                border: '6px solid var(--background)', marginTop: '-60px', marginBottom: '1rem'
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
              <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {profile.name || 'Anonymous User'}
                {profile.is_verified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: ['government', 'institution', 'agency'].includes(profile.account_type?.toLowerCase()) ? 'var(--primary-orange)' : '#1DA1F2', color: 'white', fontSize: '0.7rem' }}>✓</span>
                )}
                {profile.account_type === 'government' && (
                  <span style={{ fontSize: '1rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>✓ Government MDA</span>
                )}
                {profile.account_type === 'institution' && (
                  <span style={{ fontSize: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>🏛️ Institution</span>
                )}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {profile.account_type === 'government' && profile.state_represented ? `${profile.state_represented} State Agency` : profile.title || (profile.account_type === 'institution' ? 'Organization' : 'Creative Explorer')}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {profile.location || 'Location not specified'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/profile/edit" className="btn btn-primary">Edit Profile</Link>
              <button className="btn btn-outline">Share</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: About & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(0,0,0,0))', borderTop: '2px solid var(--primary-orange)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Engagement Analytics</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Wallet Balance</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-orange)' }}>🪙 {profile.wallet_balance || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Sales Revenue</span>
              <span style={{ fontWeight: 'bold' }}>🪙 {totalRevenue}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Products Listed</span>
              <span style={{ fontWeight: 'bold' }}>{myProducts?.length || 0}</span>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>About</h3>
            <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {profile.bio || "This user hasn't added a bio yet."}
            </p>
          </div>
          
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Skills</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(profile.skills && profile.skills.length > 0 ? profile.skills : ['No skills added yet']).map(skill => (
                <span key={skill} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Portfolio / Experience */}
        <div>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{profile.account_type === 'creative' || !profile.account_type ? 'Featured Work' : 'Initiatives & Programs'}</h3>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>{profile.account_type === 'creative' || !profile.account_type ? '+ Add Work' : '+ Add Initiative'}</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#1E1E24', height: '160px', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span style={{ fontWeight: '500' }}>Fintech Redesign</span>
              </div>
              <div style={{ background: '#2A2A35', height: '160px', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <span style={{ fontWeight: '500' }}>Brand Identity</span>
              </div>
            </div>
          </div>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>My Storefront</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {myProducts?.map(product => (
                <Link href={`/marketplace/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#2A2A35', height: '160px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', backgroundImage: product.cover_image_url ? `url(${product.cover_image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div style={{ background: 'rgba(0,0,0,0.7)', padding: '0.5rem', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '500', display: 'block' }}>{product.title}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-orange)' }}>🪙 {product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {(!myProducts || myProducts.length === 0) && (
                <p style={{ color: 'var(--text-muted)' }}>No products listed yet.</p>
              )}
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>My Purchases</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               {myPurchases?.map(purchase => (
                <div key={purchase.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link href={`/marketplace/${purchase.product_id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <div style={{ background: '#1E1E24', height: '160px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', backgroundImage: purchase.products?.cover_image_url ? `url(${purchase.products.cover_image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      <div style={{ background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '4px' }}>
                        <span style={{ fontWeight: '500', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{purchase.products?.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bought for 🪙 {purchase.amount_paid}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href={`/contracts/${purchase.id}`} className="btn btn-outline" style={{ textAlign: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
                    📄 View IP Contract
                  </Link>
                </div>
              ))}
              {(!myPurchases || myPurchases.length === 0) && (
                <p style={{ color: 'var(--text-muted)' }}>No purchases yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
