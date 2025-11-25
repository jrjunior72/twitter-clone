// src/components/CreatePost.js

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';

function CreatePost({ onNewPost }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);   // ✅ ref para o input de arquivo
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ CORREÇÃO: Permitir posts apenas com imagem (sem texto)
    // ✅ MENSAGENS DE ERRO ESPECÍFICAS
    if (!content.trim() && !image) {
      setError('Adicione texto ou uma imagem para postar');
      return;
    }
    
    // ✅ CORREÇÃO: Só validar caracteres se tiver texto
    if (content.trim() && content.length > 280) {
      setError(`O texto não pode ter mais de 280 caracteres (${content.length}/280)`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
        console.log(' - Imagem anexada:', image.name, image.size);
      }
    
      const newPost = await postsAPI.createPost(formData);
      console.log('✅ Post criado com sucesso:', newPost);

      onNewPost(newPost);

      // resetar estados
      setContent('');
      setImage(null);
      setError('');
      if (preview) URL.revokeObjectURL(preview); // libera a URL temporária
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';  // ✅ limpa o input
      
    } catch (error) {
      // setError('Erro ao criar post. Tente novamente.');
      console.error('❌ Erro ao criar post:', error);
      console.error(' - Error response:', error.response);
      console.error(' - Error message:', error.message);

      // ✅ MENSAGEM DE ERRO MAIS ESPECÍFICA
      if (error.response?.data) {
        // Se o backend retornar detalhes do erro
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          setError(errorData.detail || errorData.message || 'Erro ao criar post');
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Erro ao criar post. Tente novamente.');
        }
      } else {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      }
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
            rows="1" // ✅ Altura reduzida
            style={{ fontSize: '20px' }} // ✅ Fonte maior como Twitter
          />

            {/* Pré-visualização da imagem */}
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Pré-visualização" className="preview-img" />
                <button 
                  type="button" 
                  className="remove-image" 
                  onClick={() => { setImage(null); setPreview(null); fileInputRef.current.value = ''; }}
                >
                  ×
                </button>
              </div>
            )}
            {error && <div className="error-message" style={{marginTop: '8px'}}>{error}</div>}
        </div>
      </form>
      {/* ✅ Actions separadas - ícone, character count e botão alinhados */}
      <div className="create-post-actions">
        <div className="create-post-left-actions">
          {/* Character count */}
          <div className="character-count" style={{ 
            color: characterCount > 260 ? '#f91880' : '#8899a6',
            fontSize: '14px'
            }}>
            {characterCount}/{maxCharacters}
          </div>
          {/* Ícone de upload */}
          <div className='file-upload'>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              disabled={loading}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput" className="upload-button">
              <svg xmlns="http://www.w3.org/2000/svg" 
                  fill="none" viewBox="0 0 24 24" 
                  stroke="#1d9bf0" width="20" height="20"> {/* ✅ Ícone menor e azul */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 11a3 3 0 100-6 3 3 0 000 6zM3 20l6-6 4 4 8-8" />
              </svg>
            </label>
          </div>
        </div>  
        <div className="create-post-right-actions">
          {/* Botão Postar */}
          <button 
            type="submit" 
            className="post-button"
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && !image) || (content.trim() && content.length > 280)}
          >
            {loading ? (
              <div className="spinner"></div>   // ✅ spinner simples
            ) : (
              'Postar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;