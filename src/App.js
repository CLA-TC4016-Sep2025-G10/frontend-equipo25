import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MenuPage from './components/MenuPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ListaPersonajes from './components/ListaPersonajes';
import CrearPersonaje from './components/CrearPersonaje';
import ActualizarPersonaje from './components/ActualizarPersonaje';
import EliminarPersonaje from './components/EliminarPersonaje';
import UploadDocument from './components/UploadDocument';
import RagQuery from './components/RagQuery';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
          <Route path="/listapersonajes" element={<PrivateRoute><ListaPersonajes /></PrivateRoute>} />
          <Route path="/crearpersonaje" element={<PrivateRoute><CrearPersonaje /></PrivateRoute>} />
          <Route path="/actualizarpersonaje" element={<PrivateRoute><ActualizarPersonaje /></PrivateRoute>} />
          <Route path="/eliminarpersonaje" element={<PrivateRoute><EliminarPersonaje /></PrivateRoute>} />
          <Route path="/upload-document" element={<PrivateRoute><UploadDocument /></PrivateRoute>} />
            <Route path="/rag-query" element={<PrivateRoute><RagQuery /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
