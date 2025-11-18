import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';

function CreatePost({ onNewPost }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('O post não pode estar vazio');
      return;
    }

    if (content.length > 280) {
      setError('O post não pode ter mais de 280 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await postsAPI.createPost({ content });
      onNewPost(response.data);
      setContent('');
      setError('');
    } catch (error) {
      setError('Erro ao criar post. Tente novamente.');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const characterCount = content.length;
  const maxCharacters = 280;

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit} className="create-post-form">
        <img 
          src={user?.profile_picture || '/default-avatar.png'} 
          alt={user?.username}
          className="create-post-avatar"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiLz4KPC9zdmc+Cjwvc3ZnPg==';
          }}
        />
        <div className="create-post-input">
          <textarea
            placeholder="O que está acontecendo?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            disabled={loading}
          />
          {error && <div className="error-message" style={{marginTop: '8px'}}>{error}</div>}
        </div>
      </form>
      
      <div className="create-post-actions">
        <div className="character-count" style={{ 
          color: characterCount > 260 ? '#f91880' : '#8899a6',
          fontSize: '14px'
        }}>
          {characterCount}/280
        </div>
        <button 
          type="submit" 
          className="post-button"
          onClick={handleSubmit}
          disabled={loading || !content.trim() || content.length > 280}
        >
          {loading ? 'Postando...' : 'Postar'}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;