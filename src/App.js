import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import { MenuPage } from './components/MenuPage';
import ProfilePage from './components/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
// ...existing code...
import UploadDocument from './components/UploadDocument';
import RagQuery from './components/RagQuery';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import DocumentsPage from './components/DocumentsPage';
import UsersPage from './components/UsersPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-shell">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              {/* Removed unused character management routes */}
              <Route path="/upload-document" element={<PrivateRoute><UploadDocument /></PrivateRoute>} />
              <Route path="/rag-query" element={<PrivateRoute><RagQuery /></PrivateRoute>} />
              <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
