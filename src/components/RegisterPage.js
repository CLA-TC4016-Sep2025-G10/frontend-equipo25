import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <aside className="auth-left">
          <h2 className="brand-title">Secure<span className="brand-accent">RAG</span></h2>
          <p className="brand-desc">Create an account to start using SecureRAG's secure document search and RAG queries.</p>
        </aside>

        <main className="auth-right">
          <h2 className="auth-heading">Create account</h2>
          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter a password" required minLength={6} />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat password" required minLength={6} />
            </div>

            <button className="login-button" type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create account'}</button>
          </form>

          <div className="auth-extra">
            <p>Already have an account? <Link to="/login" className="register-button">Sign in</Link></p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
