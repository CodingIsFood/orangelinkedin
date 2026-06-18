'use client'

import { useState } from 'react'
import { signup } from './actions'

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function SignupForm() {
  const [accountType, setAccountType] = useState('creative')

  return (
    <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label htmlFor="accountType" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Account Type</label>
        <select 
          id="accountType" 
          name="accountType" 
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
        >
          <option value="creative" style={{ color: 'black' }}>Creative</option>
          <option value="institution" style={{ color: 'black' }}>Institution</option>
          <option value="government" style={{ color: 'black' }}>Government MDA</option>
        </select>
      </div>

      <div>
        <label htmlFor="fullName" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{accountType === 'creative' ? 'Full Name' : 'Organization Name'}</label>
        <input 
          id="fullName" 
          name="fullName" 
          type="text" 
          required 
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
          placeholder={accountType === 'creative' ? "Chinedu Okeke" : (accountType === 'institution' ? "e.g. African Artists Foundation" : "e.g. Lagos State Tourism Board")}
        />
      </div>

      {accountType === 'creative' && (
        <div>
          <label htmlFor="nin" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>National Identification Number (NIN)</label>
          <input 
            id="nin" 
            name="nin" 
            type="text" 
            required 
            minLength={11}
            maxLength={11}
            pattern="\d{11}"
            title="NIN must be exactly 11 digits"
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
            placeholder="e.g. 12345678901"
          />
        </div>
      )}

      {accountType === 'government' && (
        <div>
          <label htmlFor="stateRepresented" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>State Represented</label>
          <select 
            id="stateRepresented" 
            name="stateRepresented" 
            required 
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
          >
            <option value="" style={{ color: 'black' }}>Select a state...</option>
            {NIGERIAN_STATES.map(state => (
              <option key={state} value={state} style={{ color: 'black' }}>{state}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
          placeholder={accountType === 'government' ? "official@lagosstate.gov.ng" : "you@example.com"}
        />
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
          placeholder="••••••••"
          minLength={6}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
        {accountType === 'creative' ? 'Sign Up' : 'Register Organization'}
      </button>
    </form>
  )
}
