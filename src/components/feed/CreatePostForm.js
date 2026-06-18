'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { createPost } from '@/app/actions'

function SubmitButton({ isPendingOverride }) {
  const { pending } = useFormStatus()
  const isPending = pending || isPendingOverride
  
  return (
    <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', opacity: isPending ? 0.7 : 1 }}>
      {isPending ? 'Posting...' : 'Post'}
    </button>
  )
}

export default function CreatePostForm({ profile, initials }) {
  const formRef = useRef(null)

  const action = async (formData) => {
    const res = await createPost(formData)
    if (!res?.error) {
      formRef.current?.reset()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="card glass-panel create-post">
      <form ref={formRef} action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {profile?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.avatar_url} alt="Avatar" className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #444, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>{profile ? initials : 'GU'}</div>
          )}
          <textarea 
            name="content"
            placeholder={profile ? "What are you working on?" : "Sign in to post an update..."}
            disabled={!profile}
            rows="3"
            required
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical' }}
          />
        </div>
        {profile && (
          <div style={{ paddingLeft: '3.5rem' }}>
            <input 
              name="image"
              type="file"
              accept="image/*"
              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--card-border)', padding: '0.6rem 1rem', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        )}
        {profile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <SubmitButton isPendingOverride={!profile} />
          </div>
        )}
      </form>
    </div>
  )
}
