import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function MenuPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Menu</h2>
      {user && <p>Bienvenido, {user}!</p>}
      <ul>
        <li><a href="/listapersonajes">Lista todos los personajes</a></li>
        <li><a href="/crearpersonaje">Crear personaje</a></li>
        <li><a href="/actualizarpersonaje">Actualizar personaje</a></li>
        <li><a href="/eliminarpersonaje">Eliminar personaje</a></li>
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default MenuPage;
