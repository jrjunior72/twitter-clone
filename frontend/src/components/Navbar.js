import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-link">🐦 Twitter Clone</Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Feed</Link>
          {user ? (
            <>
              <span className="nav-user">Olá, {user.username}!</span>
              <Link to="/profile" className="nav-link">Perfil</Link> {/* ✅ novo link */}
              <button onClick={handleLogout} className="nav-button">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/register" className="nav-link">Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;