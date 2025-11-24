// src/components/Post.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateComment from './CreateComment';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // HOOK DE AUTENTICAÇÃO

function Post({ post, onLike }) {

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // 🆕 ESTADOS PARA EDIÇÃO DE COMENTÁRIOS
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const { user } = useAuth(); // ⬅️ OBTER USUÁRIO ATUAL

  // ⬇️ ADICIONE ESTE EFFECT PARA DEBUG
  // useEffect(() => {
  //   console.log('🔄 Estado comments atualizado:', comments);
  // }, [comments]);

    // Função para carregar comentários
  const loadComments = async () => {
    // console.log('🔄 Iniciando carregamento de comentários...');
    setLoadingComments(true);
    
    try {
        const response = await postsAPI.getPostComments(post.id);
        // console.log('✅ Dados brutos da API:', response.data);
        
        // ⬇️ EXTRAIA OS COMENTÁRIOS CORRETAMENTE
        const commentsFromAPI = response.data.results;
        // console.log('📝 Comentários extraídos:', commentsFromAPI);
        
        // ⬇️ VERIFIQUE SE É UM ARRAY VÁLIDO
        if (Array.isArray(commentsFromAPI)) {
            // console.log('🎯 Definindo comentários no estado...');
            setComments(commentsFromAPI);
            // console.log('✅ Estado comments deve ser atualizado para:', commentsFromAPI);
        } else {
            console.warn('⚠️ Comentários não são um array:', commentsFromAPI);
            setComments([]);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar comentários:', error);
        setComments([]);
    } finally {
        setLoadingComments(false);
        // console.log('🏁 Carregamento finalizado. loadingComments:', false);
    }
};

  // Função quando comentário é adicionado
  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  // 🆕 FUNÇÃO PARA INICIAR EDIÇÃO
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  // 🆕 FUNÇÃO PARA SALVAR EDIÇÃO
  const saveEditComment = async (commentId) => {
    if (!editCommentContent.trim()) {
      alert('O comentário não pode estar vazio');
      return;
    }

    setLoadingEdit(true);
    try {
      const response = await postsAPI.updateComment(post.id, commentId, {
        content: editCommentContent
      });
      
      // Atualizar o comentário na lista
      const updatedComments = comments.map(comment => 
        comment.id === commentId ? response.data : comment
      );
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('❌ Erro ao editar comentário:', error);
      alert('Erro ao editar comentário. Tente novamente.');
    } finally {
      setLoadingEdit(false);
    }
  };

  // 🆕 FUNÇÃO PARA CANCELAR EDIÇÃO
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  // 🆕 FUNÇÃO PARA EXCLUIR COMENTÁRIO
  const deleteComment = async (commentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    setLoadingDelete(true);
    try {
      await postsAPI.deleteComment(post.id, commentId);
      
      // Remover o comentário da lista
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
    } catch (error) {
      console.error('❌ Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário. Tente novamente.');
    } finally {
      setLoadingDelete(false);
    }
  };



  // Toggle comentários
  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleLike = () => {
    onLike(post.id);
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={post?.user?.profile_picture || '/default-avatar.png'} 
          alt={post?.user?.username}
          className="post-avatar"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiLz4KPC9zdmc+Cjwvc3ZnPg==';
          }}
        />
        <div className="post-user-info">
          <Link to={`/user/${post.user.username}`} className="post-username">
            {post.user.first_name && post.user.last_name 
              ? `${post.user.first_name} ${post.user.last_name}`
              : post.user.username
            }
          </Link>
          <span className="post-handle">@{post.user.username}</span>
          <span className="post-time">· {formatDate(post.created_at)}</span>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-actions">
        <button 
          className={`like-btn ${post.is_liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {post.is_liked ? '❤️' : '🤍'} {post.likes_count || 0}
        </button>
        <button 
          className="comment-btn"
          onClick={toggleComments}
        >
          💬 {comments.length > 0 ? comments.length : (post.comments_count || 0)}
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          {/* ⬇️ USE O COMPONENTE CRIADO */}
          <CreateComment 
            postId={post.id} 
            onCommentAdded={handleCommentAdded} 
          />

          {/* Lista de comentários */}
          <div className="comments-list">
            {/* {console.log('🎯 Renderizando comments-list. loading:', loadingComments, 'comments count:', comments.length)} */}
            {loadingComments ? (
                <div className="loading-comments">Carregando comentários...</div>
            ) : comments.length > 0 ? (
                  comments.map(comment => {
                    // console.log('📝 Renderizando comentário:', comment);
                    const isOwner = user?.id === comment.user?.id;
                    const isEditing = editingCommentId === comment.id; // ✅ CORRIGIDO: Definição correta
                    
                    return (
                      <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                              <img 
                                  src={comment.user?.profile_picture || '/default-avatar.png'} 
                                  alt={comment.user?.username}
                                  className="comment-avatar"
                              />
                              <div className="comment-user-info">
                                  <strong>
                                      {comment.user?.first_name && comment.user?.last_name 
                                          ? `${comment.user.first_name} ${comment.user.last_name}`
                                          : comment.user?.username
                                      }
                                  </strong>
                                  <span>@{comment.user?.username}</span>
                              </div>
                              <span className="comment-time">
                                  · {formatDate(comment.created_at)}
                              </span>
                          </div>

                          {/* 🆕 ÁREA DE CONTEÚDO DO COMENTÁRIO - COM EDIÇÃO */}
                          {isEditing ? (
                            <div className="comment-edit-area">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                disabled={loadingEdit}
                                rows="3"
                                className="comment-edit-textarea"
                              />
                              <div className="comment-edit-actions">
                                <button 
                                  onClick={cancelEditComment}
                                  disabled={loadingEdit}
                                  className="comment-edit-cancel"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  onClick={() => saveEditComment(comment.id)}
                                  disabled={loadingEdit || !editCommentContent.trim()}
                                  className="comment-edit-save"
                                >
                                  {loadingEdit ? 'Salvando...' : 'Salvar'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="comment-content">{comment.content}</p>
                          )}

                          {/* 🆕 BOTÕES DE AÇÃO - APENAS PARA DONO DO COMENTÁRIO */}
                          {isOwner && !isEditing && (
                            <div className="comment-actions">
                              <button 
                                onClick={() => startEditComment(comment)}
                                disabled={loadingDelete}
                                className="comment-edit-btn"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => deleteComment(comment.id)}
                                disabled={loadingDelete}
                                className="comment-delete-btn"
                              >
                                {loadingDelete ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </div>
                          )}

                      </div>
                    );
                  })
              ) : (
                  <div className="no-comments">Nenhum comentário ainda. Seja o primeiro a comentar!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;