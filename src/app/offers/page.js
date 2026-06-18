import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { acceptOffer, rejectOffer } from './actions';
import Link from 'next/link';

export const metadata = { title: 'Manage Offers | Orangeeconomy.ng' };

export default async function OffersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      products(title),
      buyer:profiles!buyer_id(name, avatar_url)
    `)
    .eq('seller_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Incoming Offers</h1>
        <Link href="/analytics" className="btn btn-outline">Back to Analytics</Link>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {offers?.length > 0 ? (
          offers.map(offer => (
            <div key={offer.id} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {offer.buyer?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={offer.buyer.avatar_url} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>
                  {offer.buyer?.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  <strong>{offer.buyer?.name || 'Anonymous User'}</strong> made an offer on <strong>{offer.products?.title}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                  🪙 {offer.amount}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(offer.created_at).toLocaleString()}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <form action={async () => {
                  'use server';
                  await acceptOffer(offer.id);
                }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1rem' }}>Accept</button>
                </form>
                <form action={async () => {
                  'use server';
                  await rejectOffer(offer.id);
                }}>
                  <button type="submit" className="btn btn-outline" style={{ width: '100%', padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>You have no pending offers.</p>
        )}
      </div>
    </main>
  );
}
