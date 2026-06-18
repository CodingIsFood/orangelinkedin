'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '../actions';

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await createProduct(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: '7rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>List a New Product</h1>
        
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Title</label>
            <input 
              type="text" 
              name="title" 
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="e.g. Afrobeat Sample Pack Vol. 1"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
            <textarea 
              name="description" 
              required 
              rows="4"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="Describe what's included..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (Coins 🪙)</label>
              <input 
                type="number" 
                name="price" 
                min="1"
                step="0.01"
                required 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="e.g. 50"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
              <select 
                name="category" 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="Beats">Beats</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Templates">Templates</option>
                <option value="Consultation">Consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tags (comma separated)</label>
              <input 
                type="text" 
                name="tags" 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="e.g. afrobeat, drums, vocal"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>License Rights</label>
              <select 
                name="license_type" 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="Standard Use">Standard Use</option>
                <option value="Commercial (Royalty-Free)">Commercial (Royalty-Free)</option>
                <option value="Exclusive IP Transfer">Exclusive IP Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cover Image (Public)</label>
            <input 
              type="file" 
              name="cover_image" 
              accept="image/*"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Digital File (Private, un-lockable after purchase)</label>
            <input 
              type="file" 
              name="digital_file"
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Creating...' : 'List Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
