import React, { useContext } from 'react';
import MenuSidebar from './MenuPage';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-with-sidebar fixed-page">
      <MenuSidebar />
      <section className="profile main-content">
        <header className="profile-header">
          <p className="profile-eyebrow">Account</p>
          <h1>Your Profile</h1>
          <p className="profile-copy">
            Review your user information and tokens associated with SecureRAG. This area will expand as we add more settings.
          </p>
        </header>

        <div className="profile-panels">
          <article className="profile-card">
            <h2>Identity</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{user?.name || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user?.email || 'Not provided'}</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card">
            <h2>Access</h2>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{user?.role || 'Member'}</dd>
              </div>
              <div>
                <dt>Token Expires</dt>
                <dd>{user?.tokenExpires || 'N/A'}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
