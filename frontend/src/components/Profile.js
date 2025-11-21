// src/components/Profile.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import Modal from "./Modal";

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

    // Busca dados do usuário
    useEffect(() => {
        const token = localStorage.getItem("token");

        // Evita execução prematura ou chamada com username indefinido
        if (!loggedUser) return;

        // se a URL é do próprio usuário logado, usa direto o AuthContext
        if (!username || username === loggedUser?.username) {
            setUser(loggedUser);
        } else {
            // senão, busca no backend pelo username
            fetch(`http://localhost:8080/api/auth/users/${username}/`, {
                headers: { Authorization: `Token ${token}` },
            })
            .then((res) => {
                if (!res.ok) throw new Error("Usuário não encontrado");
                return res.json();
            })
            .then((data) => setUser(data))
            .catch((err) => {
                console.error(err);
                setUser(null); // ou exibir mensagem de erro
            });
        }
    }, [username, loggedUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            return;
        }

        fetch("http://localhost:8080/api/auth/users/me/", {
            method: "PATCH", // PATCH é melhor para atualização parcial
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Erro ao salvar");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                setModalOpen(false);
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="profile-page">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Perfil de {user?.username || "usuário"}
            </h2>
            <div className="profile-card">

                <img 
                    src={user?.profile_picture || '/default-avatar.png'} 
                    alt={user?.username || 'Usuário'} 
                    className="profile-avatar"
                    onError={(e) => {
                        e.target.onerror = null; // desativa o onError depois da primeira vez
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMxZGE5ZjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAxOFYyMEgyMFYxOEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiLz4KPC9zdmc+Cjwvc3ZnPg==';
                    }}
                />

                <div className="profile-info">
                    <p><strong>Nome:</strong> {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Não informado'}</p>
                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email || 'Não informado'}</p>
                </div>

                {(!username || username === loggedUser?.username) && (
                    <div className="profile-actions">
                        <button className="edit-button" onClick={() => setModalOpen(true)}>
                        Editar Perfil
                        </button>
                    </div>
                )}
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit}>
                <h3>Editar Perfil</h3>

                <input
                    type="text"
                    placeholder="Nome"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Sobrenome"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <button type="submit" className="edit-button">Salvar</button>
                </form>
            </Modal>
        </div>

    );
}

export default Profile;
