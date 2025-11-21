# users/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health-check'), # → teste rápido de saúde da API
    path('register/', views.register_user, name='register'), # → cria novo usuário
    path('login/', views.login_user, name='login'), # → autentica e retorna
    path('profile/', views.get_profile, name='profile'), # → retorna dados do usuário autenticado (precisa enviar Authorization: Token <token>)
    path('users/', views.UserListView.as_view(), name='user-list'),  # → lista todos os usuários (exceto o logado, pela lógica da sua UserListView)
    path('users/me/', views.update_profile),  # ✅ novo endpoint
    path('users/<str:username>/', views.get_user_by_username, name='user-detail'), # → retorna dados de um usuário específico pelo username
]