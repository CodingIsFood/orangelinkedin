import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Initiatives & Programs | Orangeeconomy.ng',
  description: 'Discover grants, programs, and events from Government MDAs and Institutions.',
}

function formatDate(dateString) {
  if (!dateString) return 'Ongoing';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default async function InitiativesPage() {
  const supabase = createClient()
  
  // We will check user role to see if they can create initiatives
  const { data: { user } } = await supabase.auth.getUser()
  let canCreate = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single();
    
    if (profile?.account_type === 'government' || profile?.account_type === 'institution') {
      canCreate = true;
    }
  }

  // Fetch initiatives with creator profiles
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select(`
      *,
      profiles:creator_id (
        name,
        account_type,
        state_represented,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Initiatives & Programs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Discover and apply for grants, events, and programs from official organizations.
          </p>
        </div>
        {canCreate && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/initiatives/manage" className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>
              Review Applicants
            </Link>
            <Link href="/initiatives/new" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
              + Create Initiative
            </Link>
          </div>
        )}
      </div>

      {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>Error loading initiatives: {error.message}. Please make sure you have run the database migrations!</div>}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {initiatives?.map(initiative => {
          const profile = initiative.profiles;
          const organizationName = profile?.account_type === 'government' && profile?.state_represented 
            ? `${profile.state_represented} State Government` 
            : profile?.name || 'Unknown Organization';
            
          const isExpired = initiative.deadline && new Date(initiative.deadline) < new Date();

          return (
            <div key={initiative.id} className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
              
              {/* Top Bar: Category & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  background: 'rgba(255, 107, 0, 0.1)', 
                  color: 'var(--primary-orange)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {initiative.category}
                </span>
                
                {isExpired ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Closed</span>
                ) : (
                  <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold' }}>Active</span>
                )}
              </div>

              {/* Title & Desc */}
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{initiative.title}</h2>
                <p style={{ color: 'var(--foreground)', lineHeight: '1.6', fontSize: '0.95rem' }}>{initiative.description}</p>
              </div>

              {/* Footer info: Org, Date, Action */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {profile?.account_type === 'government' ? '🏛️' : '🏢'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{organizationName}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Deadline: {formatDate(initiative.deadline)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {initiative.external_link && !isExpired && (
                    <a href={initiative.external_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem' }}>
                      External Link
                    </a>
                  )}
                  {!isExpired && (
                    <Link href={`/initiatives/${initiative.id}/apply`} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {initiatives?.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No initiatives or programs are currently listed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
