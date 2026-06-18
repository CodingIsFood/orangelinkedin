import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Analytics Dashboard | Orangeeconomy.ng' };

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('views').eq('id', user.id).single();
  const views = profile?.views || 0;

  // Total sales from purchases table where seller_id = user.id
  const { data: salesData } = await supabase.from('purchases').select('amount_paid').eq('seller_id', user.id);
  const totalSalesCount = salesData?.length || 0;
  const totalRevenue = salesData?.reduce((acc, sale) => acc + (Number(sale.amount_paid) || 0), 0) || 0;

  // Engagement (Likes + Comments on user's posts)
  const { data: posts } = await supabase.from('posts').select('id').eq('author_id', user.id);
  const postIds = posts?.map(p => p.id) || [];
  
  let totalEngagement = 0;
  if (postIds.length > 0) {
    const { count: likesCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('post_id', postIds);
    const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).in('post_id', postIds);
    totalEngagement = (likesCount || 0) + (commentsCount || 0);
  }

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Creator Analytics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Profile Views</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary-orange)', margin: 0 }}>{views}</p>
        </div>

        <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Post Engagement</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{totalEngagement}</p>
        </div>

        <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Marketplace Sales</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{totalSalesCount}</p>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Revenue: 🪙 {totalRevenue}</p>
        </div>

      </div>

      <div className="card glass-panel" style={{ padding: '2rem' }}>
         <h2 style={{ marginBottom: '1.5rem' }}>Performance Overview</h2>
         <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--card-border)' }}>
            {/* Simple CSS Bar Chart for MVP visualization */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ width: '60%', height: `${Math.min(100, (views / 100) * 100)}%`, minHeight: '10px', background: 'var(--primary-orange)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Views</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ width: '60%', height: `${Math.min(100, (totalEngagement / 50) * 100)}%`, minHeight: '10px', background: '#3b82f6', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Engagement</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ width: '60%', height: `${Math.min(100, (totalSalesCount / 10) * 100)}%`, minHeight: '10px', background: '#10b981', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sales</span>
            </div>
         </div>
      </div>
    </main>
  );
}
