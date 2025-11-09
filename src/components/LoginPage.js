import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/rag-query');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <aside className="auth-left">
          <Link to="/" className="brand-title">
            Secure<span className="brand-accent">RAG</span>
          </Link>
          <p className="brand-desc">Platform for querying and managing characters and documents. Upload, index and query your documents using RAG-powered semantic search.</p>
          <ul className="features">
            <li>Assisted queries</li>
            <li>Character management</li>
            <li>Document upload and handling</li>
          </ul>
        </aside>

        <main className="auth-right">
          <h2 className="auth-heading">Sign in</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <button className="login-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-extra">
            <p>Don't have an account? <Link to="/register" className="register-button">Sign up</Link></p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LoginPage;
