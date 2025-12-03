# Twitter Clone 🐦

Clone funcional do Twitter desenvolvido como projeto final do curso Desenvolvedor Full Stack Python.

## 🚀 Funcionalidades Implementadas

### ✅ Backend (Django REST Framework)
- [x] Sistema de autenticação JWT
- [x] CRUD de posts/tweets
- [x] Curtir posts
- [x] Sistema de seguidores
- [x] API RESTful

### 🔄 Em Desenvolvimento
- [ ] Comentários em posts
- [ ] Feed personalizado
- [ ] Frontend React
- [ ] Upload de imagens

## 🛠️ Tecnologias

**Backend:**
- Python 3.8+
- Django 4.2
- Django REST Framework
- JWT Authentication
- PostgreSQL/SQLite

**Frontend:** (em breve)
- React.js
- Axios
- CSS Modules

## 📦 Instalação

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (em breve)
cd frontend
npm install
npm start
```

### 🔗 API Endpoints
- POST /api/auth/register/ - Registrar usuário
- POST /api/auth/login/ - Login
- GET /api/auth/profile/ - Perfil do usuário
- GET/POST /api/posts/ - Listar/Criar posts
- POST /api/posts/{id}/like/ - Curtir post

### 👨‍💻 Autor
jrjunior72 - GitHub

