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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
          <Route path="/listapersonajes" element={<PrivateRoute><ListaPersonajes /></PrivateRoute>} />
          <Route path="/crearpersonaje" element={<PrivateRoute><CrearPersonaje /></PrivateRoute>} />
          <Route path="/actualizarpersonaje" element={<PrivateRoute><ActualizarPersonaje /></PrivateRoute>} />
          <Route path="/eliminarpersonaje" element={<PrivateRoute><EliminarPersonaje /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
