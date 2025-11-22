# users/views.py

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from .models import CustomUser
from django.shortcuts import get_object_or_404
from relationships.models import Relationship

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "OK", "message": "Django is working!"})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'token': token.key,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'token': token.key,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    serializer = UserProfileSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_username(request, username):
    try:
        user = CustomUser.objects.get(username=username)
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=404)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Exclui o próprio usuário da lista
        return CustomUser.objects.exclude(id=self.request.user.id)


# 🔧 Views para Sistema de Seguir
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """Seguir um usuário"""
    try:
        user_to_follow = CustomUser.objects.get(id=user_id)
        
        if request.user == user_to_follow:
            return Response(
                {'error': 'Você não pode seguir a si mesmo'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user.follow(user_to_follow):
            return Response({
                'message': f'Agora você está seguindo {user_to_follow.username}',
                'following': True,
                'followers_count': user_to_follow.get_followers_count(),
                'following_count': request.user.get_following_count()
            })
        else:
            return Response(
                {'error': f'Você já está seguindo {user_to_follow.username}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, user_id):
    """Deixar de seguir um usuário"""
    try:
        user_to_unfollow = CustomUser.objects.get(id=user_id)
        
        if request.user.unfollow(user_to_unfollow):
            return Response({
                'message': f'Você parou de seguir {user_to_unfollow.username}',
                'following': False,
                'followers_count': user_to_unfollow.get_followers_count(),
                'following_count': request.user.get_following_count()
            })
        else:
            return Response(
                {'error': f'Você não está seguindo {user_to_unfollow.username}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_follow_status(request, user_id):
    """Verificar se está seguindo um usuário"""
    try:
        user_to_check = CustomUser.objects.get(id=user_id)
        is_following = request.user.is_following(user_to_check)
        
        return Response({
            'is_following': is_following,
            'user_id': user_id,
            'username': user_to_check.username
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def followers_list(request, username):
    """Lista de seguidores de um usuário"""
    try:
        user = CustomUser.objects.get(username=username)
        followers = CustomUser.objects.filter(following__followed=user)
        
        serializer = UserProfileSerializer(followers, many=True, context={'request': request})
        
        return Response({
            'profile_user': UserProfileSerializer(user, context={'request': request}).data,
            'followers': serializer.data,
            'count': followers.count(),
            'list_type': 'followers'
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def following_list(request, username):
    """Lista de pessoas que um usuário segue"""
    try:
        user = CustomUser.objects.get(username=username)
        following = CustomUser.objects.filter(followers__follower=user)
        
        serializer = UserProfileSerializer(following, many=True, context={'request': request})
        
        return Response({
            'profile_user': UserProfileSerializer(user, context={'request': request}).data,
            'following': serializer.data,
            'count': following.count(),
            'list_type': 'following'
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_suggestions(request):
    """Sugestões de usuários para seguir (exclui usuários já seguidos)"""
    # Pega usuários que o usuário atual ainda não segue
    following_ids = Relationship.objects.filter(follower=request.user).values_list('followed_id', flat=True)
    suggested_users = CustomUser.objects.exclude(id=request.user.id).exclude(id__in=following_ids)[:10]
    
    serializer = UserProfileSerializer(suggested_users, many=True, context={'request': request})
    
    return Response({
        'suggestions': serializer.data,
        'count': suggested_users.count()
    })