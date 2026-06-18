'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInitiative } from '../actions';

export default function NewInitiativePage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await createInitiative(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/initiatives');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px', paddingTop: '7rem', paddingBottom: '4rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Post an Initiative</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Publish grants, programs, or events to the Orangeeconomy.ng network.</p>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
            <input 
              type="text" 
              name="title" 
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="e.g. Lagos Creative Tech Grant 2026"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
              <select 
                name="category" 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="Grant">Grant / Funding</option>
                <option value="Event">Event / Festival</option>
                <option value="Program">Training Program / Incubator</option>
                <option value="Call for Submission">Call for Submission</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Deadline / Expiry Date (Optional)</label>
              <input 
                type="date" 
                name="deadline" 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
            <textarea 
              name="description" 
              required 
              rows="6"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="Describe the initiative, eligibility criteria, and how to apply..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>External Link (URL)</label>
            <input 
              type="url" 
              name="external_link" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="https://... (Where should users go to apply/register?)"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Publishing...' : 'Publish Initiative'}
          </button>
        </form>
      </div>
    </div>
  );
}
