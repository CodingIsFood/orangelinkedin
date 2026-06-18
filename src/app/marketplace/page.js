import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function MarketplacePage({ searchParams }) {
  const supabase = createClient()
  
  const query = searchParams?.q || '';
  const categoryFilter = searchParams?.category || '';

  let dbQuery = supabase
    .from('products')
    .select(`
      *,
      profiles:creator_id (
        name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }
  if (categoryFilter) {
    dbQuery = dbQuery.eq('category', categoryFilter);
  }

  const { data: products, error } = await dbQuery;

  return (
    <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>IP Marketplace</h1>
        <Link href="/marketplace/new" className="btn btn-primary">
          List Product
        </Link>
      </div>

      <form method="GET" action="/marketplace" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          name="q" 
          defaultValue={query}
          placeholder="Search for beats, digital art, templates..." 
          style={{ flex: 1, minWidth: '250px', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
        />
        <select 
          name="category" 
          defaultValue={categoryFilter}
          style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
        >
          <option value="">All Categories</option>
          <option value="Beats">Beats</option>
          <option value="Digital Art">Digital Art</option>
          <option value="Templates">Templates</option>
          <option value="Consultation">Consultation</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>Error loading products: {error.message}</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {products?.map(product => (
          <Link href={`/marketplace/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ 
              borderRadius: '12px', 
              overflow: 'hidden', 
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            >
              <div style={{ 
                height: '160px', 
                backgroundColor: 'var(--bg-secondary)', 
                backgroundImage: product.cover_image_url ? `url(${product.cover_image_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {!product.cover_image_url && (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    No Image
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {product.category}
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  {product.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.profiles.avatar_url} alt="creator" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                      {product.profiles?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {product.profiles?.name || 'Unknown'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                    🪙 {product.price}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {products?.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No products listed yet. Be the first to create one!</p>
        )}
      </div>
    </div>
  )
}
