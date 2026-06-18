import { submitTicket } from './actions';

export const metadata = {
  title: 'Support & Dispute Resolution | Orangeeconomy.ng',
  description: 'Submit tickets, file disputes, and get help from our support team.',
};

export default function SupportPage({ searchParams }) {
  const success = searchParams?.success === 'true';

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', minHeight: '100vh', maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Helpdesk & Support</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Welcome to the Orangeeconomy.ng support portal. Please describe your issue, and our mediation team will get back to you as soon as possible.
        </p>

        {success && (
          <div style={{ background: 'rgba(0, 255, 0, 0.1)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
            <strong>Ticket Submitted Successfully!</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Your reference number is #{Math.floor(Math.random() * 100000)}. We have sent a confirmation email to your registered address.
            </p>
          </div>
        )}

        <form action={submitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label htmlFor="issueType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Issue Type</label>
              <select 
                id="issueType" 
                name="issueType" 
                required 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              >
                <option value="" style={{ color: 'black' }}>Select category...</option>
                <option value="payment" style={{ color: 'black' }}>Payment / Wallet Issue</option>
                <option value="ip_dispute" style={{ color: 'black' }}>Intellectual Property Dispute</option>
                <option value="collaboration" style={{ color: 'black' }}>Collaboration / Gig Mediation</option>
                <option value="technical" style={{ color: 'black' }}>Technical Bug</option>
                <option value="other" style={{ color: 'black' }}>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority Level</label>
              <select 
                id="priority" 
                name="priority" 
                required 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
              >
                <option value="low" style={{ color: 'black' }}>Low - General Inquiry</option>
                <option value="medium" style={{ color: 'black' }}>Medium - Issue affecting workflow</option>
                <option value="high" style={{ color: 'black' }}>High - Critical dispute / Financial</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subject</label>
            <input 
              id="subject" 
              name="subject" 
              type="text" 
              required 
              placeholder="Brief description of the issue"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description & Evidence</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              rows={6}
              placeholder="Please provide as much detail as possible. If this is a dispute, describe the sequence of events."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.8rem 1rem', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Attachments</label>
            <div style={{ border: '2px dashed var(--card-border)', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-muted)' }}>
              Drag and drop files here, or click to browse.
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Supported formats: PDF, JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            Submit Ticket
          </button>
        </form>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Mediation Process</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Orangeeconomy.ng provides a structured mediation process for disputes involving IP rights and gig payments. Once a ticket is filed, our internal team will pause relevant escrow funds and invite the counterparty to respond within 48 hours.
          </p>
        </div>
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Contact Administration</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            If your issue escalates beyond standard support, or involves government initiatives, you may be redirected to specific MDA representatives handling platform oversight.
          </p>
        </div>
      </div>
    </main>
  );
}
