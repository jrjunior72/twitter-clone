# posts/urls.py

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # path('', views.debug_post_list, name='post-list'),  # ⬅️ View simples
    path('', views.PostListCreateView.as_view(), name='post-list-create'),
    path('<int:post_id>/like/', views.like_post, name='like-post'),
    path('<int:post_id>/comments/', views.CommentCreateView.as_view(), name='comment-create'),
    # 🔄 NOVA URL PARA FEED PERSONALIZADO (CBV)
    path('feed/', views.PersonalFeedView.as_view(), name='personal_feed'),
] 