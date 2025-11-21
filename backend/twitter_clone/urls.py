# twitter_clone/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')), # ⬅️ rotas do app users
    path('api/posts/', include('posts.urls')), # ⬅️ rotas do app posts
    path('api/relationships/', include('relationships.urls')), 
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)