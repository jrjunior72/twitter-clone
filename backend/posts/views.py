# posts/views.py

from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Post, Like, Comment
from .serializers import PostSerializer, PostCreateSerializer, LikeSerializer, CommentSerializer
from relationships.models import Relationship # ⬅️ COMENTE ESTA LINHA

class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination  # ✅ aqui está a correção
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        return Post.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        # Retorna o objeto completo usando PostSerializer
        self.created_post = post

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Substitui o retorno pelo PostSerializer completo
        response.data = PostSerializer(self.created_post, context={'request': request}).data
        return response

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

@api_view(['POST'])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'liked': False}, status=status.HTTP_200_OK)
        return Response({'liked': True}, status=status.HTTP_201_CREATED)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = Post.objects.get(id=post_id)
        serializer.save(user=self.request.user, post=post)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_post_list(request):
    """View de debug SIMPLES para verificar autenticação"""
    print("=" * 50)
    print("🔐 DEBUG POSTS API")
    print("=" * 50)
    
    # Verificar informações básicas
    print(f"👤 Usuário: {request.user}")
    print(f"👤 Autenticado?: {request.user.is_authenticated}")
    print(f"👤 ID: {request.user.id}")
    print(f"👤 Username: {request.user.username}")
    
    # Verificar header de autorização
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    print(f"📋 Authorization header: {auth_header}")
    
    if auth_header:
        print("✅ Header Authorization encontrado")
    else:
        print("❌ Header Authorization NÃO encontrado")
    
    # Listar alguns headers importantes
    important_headers = ['HTTP_AUTHORIZATION', 'HTTP_ORIGIN', 'HTTP_HOST']
    print("📋 Headers importantes:")
    for header in important_headers:
        value = request.META.get(header)
        if value:
            print(f"   {header}: {value}")
    
    # Verificar se há posts
    posts = Post.objects.all()
    print(f"📝 Posts no banco: {posts.count()}")
    
    # Serializar e retornar
    serializer = PostSerializer(posts, many=True)
    
    print("✅ Retornando resposta")
    print("=" * 50)
    
    return Response({
        'debug_info': {
            'user': request.user.username,
            'authenticated': request.user.is_authenticated,
            'user_id': request.user.id,
            'posts_count': posts.count(),
            'auth_header_received': bool(auth_header)
        },
        'posts': serializer.data
    })