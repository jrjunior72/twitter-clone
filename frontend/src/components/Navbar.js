// src/components/Navbar.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import './Navbar.css'; // Vamos criar este CSS

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para busca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef(null);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca em tempo real
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      console.log('🔍 Buscando por:', searchQuery);
      setLoading(true);

      try {
        const response = await usersAPI.searchUsers(searchQuery);
        console.log('📊 Resposta da API:', response.data);
        setSearchResults(response.data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce - espera 300ms após digitar
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (username) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/${username}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-link">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#1d9bf0">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
        </div>

        {/* ⬇️ BARRA DE BUSCA - NOVA */}
        {user && (
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                />
                {loading && (
                  <div className="search-loading">
                    <div className="spinner-small"></div>
                  </div>
                )}
              </div>
            </form>

            {/* DROPDOWN DE RESULTADOS */}
            {showResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <div className="results-list">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="result-item"
                        onClick={() => handleResultClick(user.username)}
                      >
                        <img
                          src={user.profile_picture || '/default-avatar.png'}
                          alt={user.username}
                          className="result-avatar"
                        />
                        <div className="result-info">
                          <div className="result-name">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.username
                            }
                          </div>
                          <div className="result-username">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="no-results">
                    {loading ? 'Buscando...' : 'Nenhum usuário encontrado'}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
        
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