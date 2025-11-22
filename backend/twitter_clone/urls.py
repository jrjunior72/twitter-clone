from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # ⬇️ COMENTE ESTAS LINhas TEMPORARIAMENTE ⬇️
    path('api/auth/', include('users.urls')), # ⬅️ DESCOMENTADA
    path('api/posts/', include('posts.urls')), # ⬅️ DESCOMENTADA
    # path('api/relationships/', include('relationships.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)