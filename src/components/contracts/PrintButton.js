"use client";

export default function PrintButton() {
  return (
    <button 
      className="btn btn-primary no-print" 
      style={{ padding: '0.6rem 1.2rem' }}
      onClick={() => window.print()}
    >
      Print PDF
    </button>
  );
}
