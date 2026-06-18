import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { submitApplication } from '../../actions';

export default async function ApplyInitiativePage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: initiative } = await supabase
    .from('initiatives')
    .select('id, title, category, deadline')
    .eq('id', params.id)
    .single();

  if (!initiative) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <Link href="/initiatives" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        &larr; Back to Initiatives
      </Link>
      
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '12px' }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.5rem' }}>
          <span style={{ background: 'rgba(255, 107, 0, 0.1)', color: 'var(--primary-orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {initiative.category} Application
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>{initiative.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Submit your application securely via Orangeeconomy.ng</p>
        </div>

        <form action={submitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input type="hidden" name="initiative_id" value={initiative.id} />
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cover Letter / Pitch</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Explain why you are a good fit for this grant or program.
            </p>
            <textarea 
              name="cover_letter" 
              required 
              rows="8"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="I am writing to apply for..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Portfolio / Supporting Document Link (Optional)</label>
            <input 
              type="url" 
              name="portfolio_link" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="https://your-portfolio.com or Google Drive link"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
