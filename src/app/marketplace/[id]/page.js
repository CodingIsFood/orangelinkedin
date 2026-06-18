import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { buyProduct, getDownloadUrl, makeOffer } from '../actions'
import { revalidatePath } from 'next/cache'

export default async function ProductDetailPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles:creator_id (
        name,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !product) {
    return <div className="container" style={{ paddingTop: '2rem' }}>Product not found.</div>
  }

  // Check if user has purchased this product
  let hasPurchased = false;
  let downloadUrl = null;

  if (user) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('product_id', product.id)
      .eq('buyer_id', user.id)
      .single()
    
    if (purchase) {
      hasPurchased = true;
      if (product.file_url) {
         downloadUrl = await getDownloadUrl(product.file_url)
      }
    }
  }

  let pendingOffer = null;
  if (user && !hasPurchased) {
    const { data: offer } = await supabase.from('offers').select('*').eq('product_id', product.id).eq('buyer_id', user.id).eq('status', 'pending').single();
    if (offer) pendingOffer = offer;
  }

  const isCreator = user?.id === product.creator_id

  return (
    <div className="container" style={{ paddingTop: '7rem', maxWidth: '900px' }}>
      <Link href="/marketplace" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        &larr; Back to Marketplace
      </Link>
      
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, gap: '2rem', padding: '2rem', borderRadius: '12px' }}>
        
        {/* Left Side: Image */}
        <div style={{ flex: '1' }}>
          <div style={{ 
            width: '100%', 
            aspectRatio: '1', 
            backgroundColor: 'var(--bg-secondary)', 
            backgroundImage: product.cover_image_url ? `url(${product.cover_image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px'
          }}>
             {!product.cover_image_url && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No Cover Image
                </div>
              )}
          </div>
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
             <span style={{ background: 'var(--primary-orange)', color: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {product.category}
             </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Created by</span>
            <Link href={`/user/${product.creator_id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              {product.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.profiles.avatar_url} alt="creator" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                  {product.profiles?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span style={{ fontWeight: '500', cursor: 'pointer' }}>
                {product.profiles?.name || 'Unknown'}
              </span>
            </Link>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-orange)', marginBottom: '1.5rem' }}>
            🪙 {product.price}
          </div>

          <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {!user ? (
               <Link href="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', fontSize: '1.1rem' }}>
                 Sign in to Buy
               </Link>
            ) : isCreator ? (
               <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                 You are the creator of this product.
               </div>
            ) : hasPurchased ? (
               <div>
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                    You own this product!
                  </div>
                  {downloadUrl ? (
                    <a href={downloadUrl} download className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', fontSize: '1.1rem', background: '#22c55e', borderColor: '#22c55e' }}>
                      Download File
                    </a>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No file attached to this product.</div>
                  )}
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <form action={async () => {
                   'use server';
                   await buyProduct(product.id);
                 }}>
                   <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                     Buy Now for 🪙 {product.price}
                   </button>
                 </form>

                 <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-muted)' }}>— OR —</div>

                 {pendingOffer ? (
                   <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                     <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>You have a pending offer of</p>
                     <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-orange)' }}>🪙 {pendingOffer.amount}</p>
                   </div>
                 ) : (
                   <form action={async (formData) => {
                     'use server';
                     await makeOffer(product.id, formData);
                   }} style={{ display: 'flex', gap: '0.5rem' }}>
                     <input type="number" name="amount" placeholder={`Max: ${product.price - 1}`} required min="1" max={product.price - 1} style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', color: 'var(--foreground)' }} />
                     <button type="submit" className="btn btn-outline" style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>Make Offer</button>
                   </form>
                 )}
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
