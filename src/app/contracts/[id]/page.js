import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import SignaturePad from '@/components/contracts/SignaturePad';
import PrintButton from '@/components/contracts/PrintButton';

export default async function ContractPage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the purchase, join product, buyer, and seller details
  const { data: purchase, error } = await supabase
    .from('purchases')
    .select(`
      *,
      products(*),
      buyer:buyer_id(name, title, location, account_type),
      seller:seller_id(name, title, location, account_type)
    `)
    .eq('id', params.id)
    .single();

  if (error || !purchase) {
    notFound();
  }

  // Ensure only buyer or seller can view the contract
  if (user.id !== purchase.buyer_id && user.id !== purchase.seller_id) {
    return (
      <div className="container" style={{ paddingTop: '7rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this contract.</p>
      </div>
    );
  }

  const product = purchase.products;
  const buyer = purchase.buyer;
  const seller = purchase.seller;

  // Extract license type from description if it exists, otherwise default
  let licenseType = 'Standard Use';
  if (product.description.includes('**License:**')) {
    const parts = product.description.split('**License:**');
    if (parts.length > 1) {
      licenseType = parts[1].split('\n')[0].trim();
    }
  }

  const contractDate = new Date(purchase.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '800px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-contract, #printable-contract * {
            visibility: visible;
          }
          #printable-contract {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 2rem !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/profile" className="btn btn-outline">&larr; Back to Profile</Link>
        <PrintButton />
      </div>

      <div id="printable-contract" className="card glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '4rem', backgroundColor: '#ffffff', color: '#000000' }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          transform: 'rotate(-45deg)',
          fontSize: '3rem',
          color: 'rgba(217, 119, 6, 0.15)',
          whiteSpace: 'normal',
          pointerEvents: 'none',
          zIndex: 0,
          fontWeight: '900',
          userSelect: 'none',
          letterSpacing: '0.2em',
          lineHeight: '2',
          textAlign: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'center',
          justifyContent: 'center'
        }}>
          {Array(100).fill('ORANGEECONOMY.NG').join(' \u00A0 \u00A0 ')}
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #ccc', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', color: '#000' }}>
            Intellectual Property Transfer Agreement
          </h1>
          <p style={{ color: '#555', fontSize: '1.1rem' }}>Transaction ID: {purchase.id}</p>
          <p style={{ color: '#555', fontSize: '1.1rem' }}>Date: {contractDate}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ textTransform: 'uppercase', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Licensor (Seller)</h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 0.2rem 0' }}>{seller?.name || 'Unknown'}</p>
            <p style={{ margin: '0 0 0.2rem 0', color: '#444' }}>{seller?.title}</p>
            <p style={{ margin: 0, color: '#444' }}>{seller?.location}</p>
          </div>
          <div>
            <h3 style={{ textTransform: 'uppercase', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Licensee (Buyer)</h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 0.2rem 0' }}>{buyer?.name || 'Unknown'}</p>
            <p style={{ margin: '0 0 0.2rem 0', color: '#444' }}>{buyer?.title}</p>
            <p style={{ margin: 0, color: '#444' }}>{buyer?.location}</p>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#000' }}>Property Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem 0', color: '#555', width: '30%' }}>Title of Work</td>
                <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{product.title}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem 0', color: '#555' }}>Category</td>
                <td style={{ padding: '1rem 0' }}>{product.category}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem 0', color: '#555' }}>Consideration (Price)</td>
                <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>🪙 {purchase.amount_paid} Orange Tokens</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 0', color: '#555' }}>Rights Granted</td>
                <td style={{ padding: '1rem 0', fontWeight: 'bold', color: '#d97706' }}>{licenseType}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#000' }}>Terms of Agreement</h2>
          <p style={{ lineHeight: '1.8', color: '#333', marginBottom: '1rem' }}>
            This Intellectual Property Transfer Agreement (the "Agreement") confirms the transaction executed on the Orangeeconomy.ng platform. By completing this transaction, the Licensor transfers the specified <strong>{licenseType}</strong> rights of the Work to the Licensee in exchange for the stated Consideration.
          </p>
          <p style={{ lineHeight: '1.8', color: '#333' }}>
            This Agreement is legally binding and enforced by the terms of service of Orangeeconomy.ng. Both parties acknowledge that this digital receipt serves as proof of purchase and license transfer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '4rem' }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Licensor Signature</p>
            {purchase.seller_signature ? (
              <img src={purchase.seller_signature} alt="Seller Signature" style={{ maxHeight: '80px', display: 'block', marginBottom: '0.5rem' }} />
            ) : user.id === purchase.seller_id ? (
              <SignaturePad contractId={purchase.id} role="seller" />
            ) : (
              <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>Pending signature...</p>
            )}
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>Digitally verified via Orangeeconomy.ng</p>
          </div>
          <div style={{ borderTop: '1px solid #000', paddingTop: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Licensee Signature</p>
            {purchase.buyer_signature ? (
              <img src={purchase.buyer_signature} alt="Buyer Signature" style={{ maxHeight: '80px', display: 'block', marginBottom: '0.5rem' }} />
            ) : user.id === purchase.buyer_id ? (
              <SignaturePad contractId={purchase.id} role="buyer" />
            ) : (
              <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>Pending signature...</p>
            )}
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>Digitally verified via Orangeeconomy.ng</p>
          </div>
        </div>

      </div>
    </main>
  );
}
