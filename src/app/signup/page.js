import Link from 'next/link'
import SignupForm from './SignupForm'

export const metadata = {
  title: 'Sign Up | OrangeLink',
  description: 'Create your OrangeLink account.',
}

export default function SignupPage({ searchParams }) {
  const error = searchParams?.error
  const message = searchParams?.message

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '3rem' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Join OrangeLink</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Connect with Nigerian Creatives
        </p>

        {error && (
          <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(255, 107, 0, 0.1)', color: 'var(--primary-orange)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <SignupForm />

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary-orange)', fontWeight: '500' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
