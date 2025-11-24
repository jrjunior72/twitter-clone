# posts/urls.py

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # path('', views.debug_post_list, name='post-list'),  # ⬅️ View simples
    path('', views.PostListCreateView.as_view(), name='post-list-create'),
    path('<int:post_id>/like/', views.like_post, name='like-post'),
        # ⬇️ URLs DE COMENTÁRIOS
    path('<int:post_id>/comments/', views.CommentListView.as_view(), name='comment-list'),  # ⬅️ LISTAR comentários
    path('<int:post_id>/comments/create/', views.CommentCreateView.as_view(), name='comment-create'),  # ⬅️ CRIAR comentário
    path('<int:post_id>/comments/<int:comment_id>/', views.CommentDetailView.as_view(), name='comment-detail'),
    # 🔄 URL PARA FEED PERSONALIZADO (CBV)
    path('feed/', views.PersonalFeedView.as_view(), name='personal_feed'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)