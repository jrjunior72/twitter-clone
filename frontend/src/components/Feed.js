import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from './Post';
import CreatePost from './CreatePost';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await postsAPI.getPosts();
            // const response = await axios.get('http://localhost:8080/api/posts/');
            setPosts(response.data);
        } catch (error) {
            setError('Erro ao carregar posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPost = (post) => {
        setPosts([post, ...posts]);
    };

    const handleLike = async (postId) => {
        try {
            await postsAPI.likePost(postId);
            // await axios.post(`http://localhost:8080/api/posts/${postId}/like/`);

            // Atualizar o estado local
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { 
                            ...post, 
                            is_liked: !post.is_liked,
                            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
                        } 
                    : post
            ));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    if (loading) {
        return (
        <div className="feed">
            <div className="feed-header">
            <h2>Home</h2>
            </div>
            <div className="loading">Carregando posts...</div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="feed">
            <div className="feed-header">
            <h2>Home</h2>
            </div>
            <div className="error-message">{error}</div>
        </div>
        );
    }

    return (
        <div className="feed">
            <div className="feed-header">
                <h2>Home</h2>
            </div>
            
            <CreatePost onNewPost={handleNewPost} />
            
            <div className="posts">
                {posts.length === 0 ? (
                <div className="empty-feed">
                    <p>Nenhum post ainda. Seja o primeiro a postar!</p>
                </div>
                ) : (
                posts.map(post => (
                    <Post 
                    key={post.id} 
                    post={post} 
                    onLike={handleLike}
                    />
                ))
                )}
            </div>
        </div>
  );
}

export default Feed;