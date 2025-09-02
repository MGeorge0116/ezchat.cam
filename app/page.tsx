'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="page">
      <main className="wrap">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Promoted Rooms</h2>
            <button className="btn" onClick={() => alert('Open promote flow…')}>Promote</button>
          </div>
          <div className="promoted">
            No promoted rooms yet.{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Open promote flow…');
              }}
            >
              Promote
            </a>{' '}
            yours to appear here.
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Active Chatrooms</h2>
            <button className="btn" onClick={() => location.reload()}>Refresh</button>
          </div>
          <div className="empty">No active rooms.</div>
        </section>
      </main>

      <style jsx>{`
        .wrap{max-width:980px;margin:24px auto;padding:0 16px}
        .section{margin-bottom:24px}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
        .section-title{font-size:20px;font-weight:700}
        .btn{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:var(--btn);border:1px solid var(--btn-edge);color:var(--text);border-radius:8px;font-weight:600;cursor:pointer}
        .btn:hover{background:var(--btn-hover)}
        .promoted{background:var(--promo-gradient);border:1px solid var(--promo-border);border-radius:10px;padding:12px 14px;color:var(--promo-text);box-shadow:inset 0 1px 0 #0001;font-size:14px}
        .promoted a{color:var(--promo-link);font-weight:600;text-decoration:none}
        .promoted a:hover{text-decoration:underline}
        .empty{color:var(--muted);font-size:14px;padding:12px 2px}
      `}</style>
    </div>
  );
}
