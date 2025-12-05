// src/components/Profile.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import Modal from "./Modal";
import { usersAPI, authAPI } from '../services/api';

function Profile() {
    const { user: loggedUser, updateProfile } = useAuth(); // usuário logado
    const { username } = useParams(); // pega o username da URL
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        bio: "",                // ⬅️ NOVO CAMPO
        profile_picture: null,  // ⬅️ NOVO CAMPO
    });

    const [imagePreview, setImagePreview] = useState(null);  // ⬅️ PREVIEW DA IMAGEM

    //Sistema de seguidores/seguindo
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Sistema de troca de senhas
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Redireciona /profile para /:username
    useEffect(() => {
        if (!username && loggedUser?.username) {
            navigate(`/${loggedUser.username}`, { replace: true });
        }
    }, [username, loggedUser, navigate]);

    // Preenche formData quando user muda - ATUALIZADO
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                bio: user.bio || "",                    // ⬅️ INICIALIZAR BIO
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
                    // ⬇️ CORREÇÃO: A API retorna { data } - precisamos extrair
                    const response = await usersAPI.getUserByUsername(username);
                    userData = response.data; // ⬅️ EXTRAIA OS DADOS
                    console.log("📥 Dados do usuário recebidos:", userData);
                }
                
                setUser(userData);
                
                // Atualiza dados de follow se disponíveis no response
                if (userData) {
                    // Atualiza contadores se disponíveis
                    if (userData.followers_count !== undefined) {
                        setFollowersCount(userData.followers_count);
                    }
                    if (userData.following_count !== undefined) {
                        setFollowingCount(userData.following_count);
                    }
                    if (userData.is_following !== undefined) {
                        setIsFollowing(userData.is_following);
                    }
                    
                    // ⬇️ SE NÃO VÊM NA RESPOSTA, FAÇA UMA CHAMADA SEPARADA
                    if (!isOwnProfile && userData.id) {
                        try {
                            const followResponse = await usersAPI.checkFollowStatus(userData.id);
                            setIsFollowing(followResponse.data.is_following || false);
                        } catch (followError) {
                        }
                    }
                }
                
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [username, loggedUser]);

    const [postsCount, setPostsCount] = useState(0);

    // Effect para contar posts do usuário
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (!user) return;
        
        const countUserPosts = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_URL}/posts/?user=${user.id}`, {
                    headers: { 
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();

                    // ⬇️ VERIFIQUE DIFERENTES ESTRUTURAS DE RESPOSTA
                    const count = data.count || data.results?.length || 0;
                    setPostsCount(count);
                }
            } catch (error) {
                setPostsCount(0);
            }
        };

        countUserPosts();
    }, [user]);

    const handleFollow = async () => {
        if (!user) return;
        
        try {
            // ⬇️ CORREÇÃO: Use usersAPI em vez de relationshipsAPI
            await usersAPI.followUser(user.id);
            setIsFollowing(true);
            setFollowersCount(prev => prev + 1);
        } catch (error) {
            console.error('Erro ao seguir usuário:', error);
        }
    };

    const handleUnfollow = async () => {
        if (!user) return;
        
        try {
            // ⬇️ CORREÇÃO: Use usersAPI em vez de relationshipsAPI
            await usersAPI.unfollowUser(user.id);
            setIsFollowing(false);
            setFollowersCount(prev => prev - 1);
        } catch (error) {
            console.error('Erro ao parar de seguir:', error);
        }
    };

    // Handle file upload para foto de perfil
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profile_picture: file
            });
            
            // Criar preview da imagem
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove foto de perfil
    const handleRemoveImage = () => {
        setFormData({
            ...formData,
            profile_picture: null
        });
        setImagePreview(null);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // ⬇️ CORREÇÃO: Chamar updateProfile do AuthContext
            const submitData = new FormData();

            // Adicionar campos de texto
            submitData.append('first_name', formData.first_name);
            submitData.append('last_name', formData.last_name);
            submitData.append('email', formData.email);
            submitData.append('bio', formData.bio);

            // Adicionar arquivo se existir
            if (formData.profile_picture && typeof formData.profile_picture !== 'string') {
                submitData.append('profile_picture', formData.profile_picture);
            }

            // ⬇️ CORREÇÃO: Chamar updateProfile do AuthContext
            const result = await updateProfile(submitData);
            
            if (result.success) {
                setUser(result.user);
                setModalOpen(false);
                alert('Perfil atualizado com sucesso!');
                
                // Atualizar preview se necessário
                if (result.user.profile_picture) {
                    setImagePreview(result.user.profile_picture);
                }
            } else {
                alert(`Erro ao atualizar perfil: ${result.error}`);
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
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

    // FUNÇÃO PARA TROCAR SENHA
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangingPassword(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            // Validações básicas no frontend
            if (passwordData.new_password !== passwordData.confirm_password) {
                setPasswordError('As senhas não coincidem');
                setChangingPassword(false);
                // ⬇️ LIMPAR CAMPOS APÓS ERRO
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                return;
            }

            if (passwordData.new_password.length < 8) {
                setPasswordError('A senha deve ter pelo menos 8 caracteres');
                setChangingPassword(false);
                // ⬇️ LIMPAR CAMPOS APÓS ERRO
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                return;
            }

            console.log('📤 Enviando dados de troca de senha:', passwordData);

            const response = await authAPI.changePassword(passwordData);

            console.log('✅ Resposta da troca de senha:', response.data);
            
            setPasswordSuccess('Senha alterada com sucesso!');
            
            // Limpar formulário após sucesso
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            
            // Fechar modal após 2 segundos
            setTimeout(() => {
                setPasswordModalOpen(false);
                setPasswordSuccess('');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro detalhado na troca de senha:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setPasswordError(error.response?.data?.error || 'Erro ao alterar senha');
            // ⬇️ LIMPAR CAMPOS APÓS ERRO
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } finally {
            setChangingPassword(false);
        }
    };

    // FUNÇÃO PARA ATUALIZAR OS CAMPOS
    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // LIMPAR MODAL DE TROCA DE SENHA ABRIR/FECHAR MODAL
    const resetPasswordModal = () => {
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setPasswordError('');
        setPasswordSuccess('');
        setChangingPassword(false);
    };

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
                <>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="twitter-edit-btn"
                    >
                        Editar perfil
                    </button>
                    {/* ⬇️ NOVO BOTÃO - TROCAR SENHA */}
                    <button 
                        onClick={() => {
                            resetPasswordModal();
                            setPasswordModalOpen(true);
                        }} 
                        className="twitter-password-btn"
                    >
                        Trocar senha
                    </button>
                </>
            )}
        </div>


        {/* Modal de edição */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            <form onSubmit={handleSubmit} className="modal-form-twitter">
                <h3>Editar perfil</h3>

                {/* UPLOAD DE FOTO DE PERFIL */}
                <div className="form-group-image">
                    <label className="image-upload-label">Foto de perfil</label>
                    <div className="image-upload-container">
                        <div className="image-preview">
                            <img 
                                src={imagePreview || user?.profile_picture || '/default-avatar.png'} 
                                alt="Preview" 
                                className="image-preview-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE4IDQgMTIgNEM5Ljc5MDg2IDQgOCA1Ljc5MDg2IDggOEM4IDEwLjIwOTEgOS43OTA4NiAxMiAxMiAxMlpNMTIgMTRDOS4zMyAxNCA0IDE1LjM0IDQgMThWMjBIMjBWMTguQzIwIDE1LjM0IDE0LjY3IDE0IDEyIDE0WiIvPgo8L3N2Zz4KPC9zdmc+';
                                }}
                            />
                        </div>
                        <div className="image-upload-controls">
                            <label htmlFor="profile-picture" className="btn-upload">
                                Escolher imagem
                            </label>
                            <input
                                id="profile-picture"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                            />
                            {imagePreview && (
                                <button 
                                    type="button" 
                                    onClick={handleRemoveImage}
                                    className="btn-remove-image"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* BIO */}
                <div className="form-group">
                    <label>Bio</label>
                    <textarea
                        placeholder="Conte um pouco sobre você..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="form-textarea"
                        rows="3"
                        maxLength="500"
                    />
                    <div className="char-counter">
                        {formData.bio.length}/500
                    </div>
                </div>

                {/* CAMPOS EXISTENTES */}
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
        {/* ⬇️ MODAL DE TROCA DE SENHA */}
        <Modal isOpen={passwordModalOpen} onClose={() => {
            resetPasswordModal();
            setPasswordModalOpen(false);
        }}>
            <form onSubmit={handleChangePassword} className="modal-form-twitter">
                <h3>Alterar Senha</h3>
                
                {passwordError && (
                    <div className="error-message">{passwordError}</div>
                )}
                
                {passwordSuccess && (
                    <div className="success-message">{passwordSuccess}</div>
                )}

                <div className="form-group">
                    <label>Senha Atual</label>
                    <input
                        type="password"
                        placeholder="Digite sua senha atual"
                        value={passwordData.current_password}
                        onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nova Senha</label>
                    <input
                        type="password"
                        placeholder="Digite a nova senha (mín. 8 caracteres)"
                        value={passwordData.new_password}
                        onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                        className="form-input"
                        minLength="8"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Confirmar Nova Senha</label>
                    <input
                        type="password"
                        placeholder="Confirme a nova senha"
                        value={passwordData.confirm_password}
                        onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => {
                            resetPasswordModal();
                            setPasswordModalOpen(false);
                        }}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={changingPassword}
                        className="btn-primary"
                    >
                        {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                </div>
            </form>
        </Modal>
    </div>
    );
}

export default Profile;

//-------------------------------------------------------------

