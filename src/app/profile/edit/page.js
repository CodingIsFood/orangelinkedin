import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'

export const metadata = {
  title: 'Edit Profile | OrangeLink',
  description: 'Update your OrangeLink profile details.',
}

export default async function EditProfilePage({ searchParams }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current profile data to pre-fill the form
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/profile')
  }

  const error = searchParams?.error

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '7rem', paddingBottom: '3rem', minHeight: '100vh' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Edit Profile</h1>
          <Link href="/profile" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</Link>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="avatar" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Profile Image</label>
            <input 
              id="avatar" 
              name="avatar" 
              type="file" 
              accept="image/*"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
            />
          </div>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              defaultValue={profile.name || ''}
              required 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Professional Title</label>
            <input 
              id="title" 
              name="title" 
              type="text" 
              defaultValue={profile.title || ''}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              placeholder="e.g. Senior Product Designer"
            />
          </div>

          <div>
            <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location</label>
            <input 
              id="location" 
              name="location" 
              type="text" 
              defaultValue={profile.location || ''}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              placeholder="e.g. Lagos, Nigeria"
            />
          </div>

          <div>
            <label htmlFor="skills" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Skills (comma separated)</label>
            <input 
              id="skills" 
              name="skills" 
              type="text" 
              defaultValue={(profile.skills || []).join(', ')}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              placeholder="e.g. UI Design, React, Photography"
            />
          </div>

          <div>
            <label htmlFor="bio" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>About You</label>
            <textarea 
              id="bio" 
              name="bio" 
              rows="5"
              defaultValue={profile.bio || ''}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
              placeholder="Tell us about your creative journey..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
