from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('profile/', views.get_profile, name='profile'),
    path('users/', views.UserListView.as_view(), name='user-list'),  # ⬅️ NOVA LINHA
]