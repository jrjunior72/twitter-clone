// src/components/Feed.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { postsAPI } from '../services/api';
import Post from './Post';
import CreatePost from './CreatePost';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    const fetchPosts = async (page) => {
        try {
            // Substituido por getPersonalFeed
            // const data = await postsAPI.getPosts(page); 
            // console.log("Posts API response:", data);
            // 🔄 MUDANÇA AQUI: usar getPersonalFeed em vez de getPosts
            const data = await postsAPI.getPersonalFeed(page);
            console.log("📱 Feed personalizado:", data);            
            // acumula posts ao invés de substituir
            setPosts((prevPosts) => {
                const merged = [...prevPosts, ...data.results];
                // remove duplicados pelo id
                const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
                return unique;
            });
            setHasMore(!!data.next);

        } catch (error) {
            setError('Erro ao carregar posts');
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPost = (post) => {
        if (!post) return; // evita undefined
        setPosts((prevPosts) => [post, ...prevPosts]);
    };

    const handleLike = async (postId) => {
        try {
            await postsAPI.likePost(postId);

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

    const observer = useRef();
    // Observa o último post da lista
    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    if (loading && posts.length === 0) {
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
                posts.map((post, index) => {
                    if (index === posts.length - 1) {
                        return (
                            <div ref={lastPostRef} key={post.id}>
                                <Post post={post} onLike={handleLike} />
                            </div>
                        );
                    } else {
                        return (
                            <Post
                                key={post.id} 
                                post={post} 
                                onLike={handleLike}
                            />
                        );
                    }
                })
            )}
            </div>

        {loading && <div className="loading">Carregando mais posts...</div>}      
                
        </div>
    );
}

export default Feed;