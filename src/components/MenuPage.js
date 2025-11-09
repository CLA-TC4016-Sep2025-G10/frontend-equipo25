import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/upload-document', label: 'Upload Document', blurb: 'Send a new knowledge source to SecureRAG.' },
  { to: '/rag-query', label: 'RAG Query', blurb: 'Ask questions against the indexed knowledge base.' },
  { to: '/profile', label: 'Profile', blurb: 'Review your account and token information.' }
];

const GradientLabel = ({ children }) => (
  <span style={{
    fontFamily: 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    fontWeight: 800,
    letterSpacing: '0.04em',
    fontSize: '1.18rem',
    background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
  }}>
    {children}
  </span>
);

export function MenuSidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <aside className="menu-sidebar">
      <div className="sidebar-header">
        <h2>Me<span className="brand-accent">nu</span></h2>
        {user && <p className="sidebar-user">Welcome, {user.name || user.email || 'User'}!</p>}
      </div>
      <nav>
        <ul>
          {navLinks.map(({ to, label }) => (
            <li key={to} className={location.pathname === to ? 'active' : ''}>
              <Link to={to}>
                <GradientLabel>{label}</GradientLabel>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function MenuPage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-with-sidebar fixed-page">
      <MenuSidebar />
      <section className="menu-main main-content">
        <div className="menu-hero">
          <span className="menu-eyebrow">SecureRAG Console</span>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ''}.</h1>
          <p className="menu-hero-copy">
            Choose what you would like to do next. Upload relevant documents or test the retrieval pipeline with a query.
          </p>
        </div>

        <div className="menu-grid">
          {navLinks.slice(0, 2).map(({ to, label, blurb }) => (
            <Link key={to} to={to} className="menu-card">
              <div>
                <h3>{label}</h3>
                <p>{blurb}</p>
              </div>
              <span className="card-link">Go</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MenuSidebar;
