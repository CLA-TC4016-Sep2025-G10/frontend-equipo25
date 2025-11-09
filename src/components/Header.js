import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const protectedRoutes = ['/upload-document', '/rag-query', '/profile'];
  const onProtectedPage = protectedRoutes.some((path) => location.pathname.startsWith(path));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="brand">
        <Link to="/">Secure<span className="brand-accent">RAG</span></Link>
      </div>

      <nav className="site-nav" aria-label="Main navigation">
        <ul className="nav-links">
          {user ? (
            <>
              {/* Authenticated header no longer mirrors sidebar links */}
            </>
          ) : !onProtectedPage ? (
            <>
              <li><Link className="nav-link" to="/login">Sign in</Link></li>
              <li><Link className="nav-link register-button" to="/register">Register</Link></li>
            </>
          ) : null}
        </ul>
      </nav>

      <div className="user-area">
        {(user || onProtectedPage) ? (
          <>
            {user && <span className="user-info">Hello, {user.name || user.email}</span>}
            <button className="logout-button" onClick={handleLogout}>Sign out</button>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
