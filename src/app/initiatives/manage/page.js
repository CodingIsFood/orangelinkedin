import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ManageApplicationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's initiatives and the applications tied to them
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select(`
      id,
      title,
      category,
      initiative_applications (
        id,
        cover_letter,
        portfolio_link,
        status,
        created_at,
        applicant:applicant_id (
          id,
          name,
          title,
          avatar_url
        )
      )
    `)
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="container" style={{ paddingTop: '7rem' }}>Error loading data. Have you run the Phase 5 SQL script?</div>;
  }

  // Count total applications
  const totalApps = initiatives.reduce((sum, init) => sum + (init.initiative_applications?.length || 0), 0);

  return (
    <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Manage Applications</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review candidates who have applied to your initiatives.</p>
        </div>
        <Link href="/initiatives" className="btn btn-outline">&larr; Back to Feed</Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px', flex: 1, borderTop: '2px solid var(--primary-orange)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Active Initiatives</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{initiatives.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px', flex: 1, borderTop: '2px solid #4ade80' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Applicants</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalApps}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {initiatives.map(initiative => (
          <div key={initiative.id}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary-orange)' }}>■</span> {initiative.title}
              <span style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'normal' }}>
                {initiative.initiative_applications?.length || 0} applicants
              </span>
            </h2>

            {(!initiative.initiative_applications || initiative.initiative_applications.length === 0) ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-muted)' }}>
                No applications received yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {initiative.initiative_applications.map(app => (
                  <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '1.5rem', flexDirection: 'column', md: { flexDirection: 'row' } }}>
                    
                    <div style={{ display: 'flex', gap: '1rem', width: '250px' }}>
                      {app.applicant?.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={app.applicant.avatar_url} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {app.applicant?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <Link href={`/user/${app.applicant?.id}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none', display: 'block' }}>
                          {app.applicant?.name}
                        </Link>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{app.applicant?.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pitch / Cover Letter</h4>
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                        {app.cover_letter}
                      </div>
                      
                      {app.portfolio_link && (
                        <div style={{ marginTop: '1rem' }}>
                          <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                            🔗 View Portfolio Link
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
