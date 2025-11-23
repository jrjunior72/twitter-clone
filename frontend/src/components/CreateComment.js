// src/components/CreateComment.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import './CreateComment.css'; // ⬅️ IMPORTE O CSS


function CreateComment({ postId, onCommentAdded }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const characterCount = content.length;
    const maxCharacters = 500;
    
    // Determinar classe do contador de caracteres
    const getCharacterCountClass = () => {
        if (characterCount > 450) return 'danger';
        if (characterCount > 400) return 'warning';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            setError('O comentário não pode estar vazio');
            return;
        }
        
        if (content.length > maxCharacters) {
            setError(`O comentário não pode ter mais de ${maxCharacters} caracteres`);
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await postsAPI.createComment(postId, { content });
            onCommentAdded(response.data);
            
            // Resetar o formulário
            setContent('');
            setError('');
            
            console.log("Novo comentário criado:", response.data);
            } catch (error) {
                setError('Erro ao criar comentário. Tente novamente.');
                console.error('Error creating comment:', error);
            } finally {
                setLoading(false);
        }
    };


    return (
        <div className={`create-comment ${error ? 'has-error' : ''}`}>
            <form onSubmit={handleSubmit} className="create-comment-form">
                <img 
                    src={user?.profile_picture || '/default-avatar.png'} 
                    alt={user?.username}
                    className="create-comment-avatar"
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiLz4KPC9zdmc+Cjwvc3ZnPg==';
                }}
                />
                <div className="create-comment-input">
                <textarea
                    placeholder="Escreva um comentário..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={maxCharacters}
                    disabled={loading}
                    rows="2"
                />
                
                {error && <div className="error-message">{error}</div>}
                </div>
            </form>
            
            <div className="create-comment-actions">
                <div className={`character-count ${getCharacterCountClass()}`}>
                    {characterCount}/{maxCharacters}
                </div>
                <button 
                    type="submit" 
                    className="comment-submit-btn"
                    onClick={handleSubmit}
                    disabled={loading || !content.trim() || content.length >  maxCharacters}
                >
                    {loading ? (
                        <div className="spinner-small"></div>
                ) : (
                    'Comentar'
                )}
                </button>
            </div>
        </div>
    );
}

export default CreateComment;