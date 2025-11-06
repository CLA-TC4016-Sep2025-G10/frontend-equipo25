import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  // Temporarily bypass authentication for development
  return children;
  
  // Original authentication logic:
  // const { user } = useContext(AuthContext);
  // return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
