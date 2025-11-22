import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Post({ post, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Implement comment submission
      // This would make an API call to submit the comment
      const comment = {
        id: Date.now(), // Temporary ID
        content: newComment,
        user: post.user, // Current user
        created_at: new Date().toISOString()
      };
      
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={post.user.profile_picture || '/default-avatar.png'} 
          alt={post.user.username}
          className="post-avatar"
        />
        <div className="post-user-info">
          <Link to={`/user/${post.user.username}`} className="post-username">
            {post.user.first_name} {post.user.last_name}
          </Link>
          <span className="post-handle">@{post.user.username}</span>
          <span className="post-time">{formatDate(post.created_at)}</span>
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
          ♥ {post.likes_count}
        </button>
        <button 
          className="comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comments_count}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>
          
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <img 
                  src={comment.user.profile_picture || '/default-avatar.png'} 
                  alt={comment.user.username}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-username">
                      {comment.user.first_name} {comment.user.last_name}
                    </span>
                    <span className="comment-time">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;