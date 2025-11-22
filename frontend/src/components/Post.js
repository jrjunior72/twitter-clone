import React from 'react';
import { Link } from 'react-router-dom';

function Post({ post, onLike }) {
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
        <button className="comment-btn">
          💬 {post.comments_count || 0}
        </button>
      </div>
    </div>
  );
}

export default Post;