import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
  <p>© {new Date().getFullYear()} SecureRAG — RAG Service</p>
        <p className="muted">Built for the course — Diseño y Construcción de Software</p>
      </div>
    </footer>
  );
};

export default Footer;
