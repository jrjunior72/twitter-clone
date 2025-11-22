// src/components/Profile.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import Modal from "./Modal";
// src/components/Profile.js - ADICIONAR
import { usersAPI, relationshipsAPI, authAPI } from '../services/api';

function Profile() {
    const { user: loggedUser } = useAuth(); // usuário logado
    const { username } = useParams(); // pega o username da URL
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    //Sistema de seguidores/seguindo
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Redireciona /profile para /:username
    useEffect(() => {
        if (!username && loggedUser?.username) {
            navigate(`/${loggedUser.username}`, { replace: true });
        }
    }, [username, loggedUser, navigate]);

    // Preenche formData quando user muda
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
            });
        }
    }, [user]);

 // Busca dados do usuário usando services/api------------------------------
    useEffect(() => {
        if (!loggedUser) return;

        const loadUserProfile = async () => {
            setLoading(true);
            try {
                let userData;
                
                // Se é o próprio perfil, usa dados do contexto
                if (!username || username === loggedUser?.username) {
                    userData = loggedUser;
                } else {
                    // Busca perfil de outro usuário via API service
                    userData = await usersAPI.getUserByUsername(username);
                }
                
                setUser(userData);
                
                // Atualiza dados de follow se disponíveis no response
                if (userData.followers_count !== undefined) {
                    setFollowersCount(userData.followers_count);
                    setFollowingCount(userData.following_count);
                    setIsFollowing(userData.is_following || false);
                }
                
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [username, loggedUser]);

    const [postsCount, setPostsCount] = useState(0);

    // Effect para contar posts do usuário
    useEffect(() => {
        if (!user) return;
        
        const countUserPosts = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`http://localhost:8080/api/posts/?user=${user.id}`, {
                    headers: { 
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setPostsCount(data.count || data.results?.length || 0);
                }
            } catch (error) {
                console.error('Erro ao contar posts:', error);
                setPostsCount(0);
            }
        };

        countUserPosts();
    }, [user]);


    const handleFollow = async () => {
        if (!user) return;
        
        try {
            await relationshipsAPI.followUser(user.id);
            setIsFollowing(true);
            setFollowersCount(prev => prev + 1);
        } catch (error) {
            console.error('Erro ao seguir usuário:', error);
            alert('Erro ao seguir usuário');
        }
    };

    const handleUnfollow = async () => {
        if (!user) return;
        
        try {
            await relationshipsAPI.unfollowUser(user.id);
            setIsFollowing(false);
            setFollowersCount(prev => prev - 1);
        } catch (error) {
            console.error('Erro ao parar de seguir:', error);
            alert('Erro ao parar de seguir');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Usando authAPI para atualizar perfil
            const updatedUser = await authAPI.updateProfile(formData);
            setUser(updatedUser);
            setModalOpen(false);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil');
        }
    };

    const isOwnProfile = !username || username === loggedUser?.username;

    if (loading) {
        return (
            <div className="profile-page">
                <div className="loading">Carregando perfil...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="error-message">Usuário não encontrado</div>
            </div>
        );
    }

return (
    <div className="profile-container">
        {/* Cabeçalho - CORREÇÃO DE CORES */}
        <div className="profile-header-twitter">
            <div className="profile-back-button" onClick={() => navigate(-1)}>
                ←
            </div>
            <div className="profile-header-info">
                <div className="profile-display-name" style={{color: '#0f1419'}}>
                    {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                </div>
                <div className="profile-tweets-count" style={{color: '#536471'}}>
                    {postsCount || 0} Tweets
                </div>
            </div>
        </div>

        {/* Banner e Avatar */}
        <div className="profile-banner">
            <div className="profile-banner-default"></div>
            <div className="profile-avatar-container">
                <img 
                    src={user?.profile_picture || '/default-avatar.png'} 
                    alt={user?.username} 
                    className="profile-avatar-twitter"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE4IDQgMTIgNEM5Ljc5MDg2IDQgOCA1Ljc5MDg2IDggOEM4IDEwLjIwOTEgOS43OTA4NiAxMiAxMiAxMlpNMTIgMTRDOS4zMyAxNCA0IDE1LjM0IDQgMThWMjBIMjBWMTguQzIwIDE1LjM0IDE0LjY3IDE0IDEyIDE0WiIvPgo8L3N2Zz4KPC9zdmc+';
                    }}
                />
            </div>
        </div>

        {/* Informações do perfil */}
        <div className="profile-info-twitter">
            <div className="profile-names">
                <h2 className="profile-display-name-main">
                    {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                </h2>
                <div className="profile-username-twitter">@{user?.username}</div>
            </div>

            {user?.bio && (
                <div className="profile-bio">
                    {user.bio}
                </div>
            )}

            <div className="profile-details-twitter">
                {user?.email && (
                    <div className="profile-detail">
                        <span className="profile-detail-icon">📧</span>
                        {user.email}
                    </div>
                )}
                {/* Data de entrada - ADICIONAR */}
                <div className="profile-detail">
                    <span className="profile-detail-icon">🗓️</span>
                    Entrou em {new Date(user?.date_joined).toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                    })}
                </div>
            </div>

            {/* Estatísticas de Follow - CORREÇÃO DE LAYOUT */}
            <div className="profile-stats-twitter">
                <div className="profile-stat-twitter">
                    <span className="stat-number-twitter">{followingCount}</span>
                    <span className="stat-label-twitter">Seguindo</span>
                </div>
                <div className="profile-stat-twitter">
                    <span className="stat-number-twitter">{followersCount}</span>
                    <span className="stat-label-twitter">Seguidores</span>
                </div>
            </div>
        </div>

        {/* Botão de ação - CORREÇÃO DE CORES */}
        <div className="profile-actions-twitter">
            {!isOwnProfile && user && (
                <button 
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className={`twitter-follow-btn ${isFollowing ? 'following' : ''}`}
                    style={{
                        backgroundColor: isFollowing ? 'white' : '#1d9bf0',
                        color: isFollowing ? '#0f1419' : 'white',
                        border: isFollowing ? '1px solid #cfd9de' : '1px solid #1d9bf0'
                    }}
                >
                    {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
            )}

            {isOwnProfile && (
                <button 
                    onClick={() => setModalOpen(true)}
                    className="twitter-edit-btn"
                >
                    Editar perfil
                </button>
            )}
        </div>


            {/* Modal de edição */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit} className="modal-form-twitter">
                    <h3>Editar perfil</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Nome"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Sobrenome"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Profile;

//-------------------------------------------------------------

