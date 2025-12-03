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
from django.db.models import Q

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def update_server(request):
    """Atualiza o código no PythonAnywhere via webhook do GitHub"""
    if request.method in ["POST", "GET"]:
        try:
            project_path = '/home/ricardoferreirajr/twitter-clone-fixed/backend/'
            venv_path = os.path.join(project_path, 'env/bin/activate')

            if not os.path.exists(project_path):
                return HttpResponse(f"❌ Diretório não existe: {project_path}", status=500)

            # Passo 1: Atualizar código
            commands = [
                ['git', 'fetch', 'origin'],
                ['git', 'reset', '--hard', 'origin/main'],
            ]

            results = []
            for cmd in commands:
                result = subprocess.run(cmd, capture_output=True, text=True, cwd=project_path)
                results.append({
                    'command': ' '.join(cmd),
                    'stdout': result.stdout,
                    'stderr': result.stderr,
                    'returncode': result.returncode
                })

            # Se algum comando falhou
            for result in results:
                if result['returncode'] != 0:
                    return HttpResponse(f"❌ Erro no git:<br>{results}", status=500)

            # Passo 2: Rodar migrações
            migrate_cmd = subprocess.run(
                ['bash', '-c', f'source {venv_path} && python manage.py migrate'],
                capture_output=True, text=True, cwd=project_path
            )

            # Passo 3: Reiniciar aplicação
            wsgi_result = os.system("touch /var/www/ricardoferreirajr_pythonanywhere_com_wsgi.py")

            return HttpResponse(
                f"✅ Deploy concluído com sucesso!<br>"
                f"Migrations: {migrate_cmd.stdout}<br>"
                f"WSGI touch: {wsgi_result}"
            )

        except Exception as e:
            import traceback
            error_details = f"Exception: {str(e)}<br>Traceback: {traceback.format_exc()}"
            return HttpResponse(f"❌ Erro na atualização:<br>{error_details}", status=500)

    return HttpResponse("Método não permitido", status=405)



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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Altera a senha do usuário autenticado
    """
    user = request.user
    
    # Obter dados da requisição
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    # Validações básicas
    if not all([current_password, new_password, confirm_password]):
        return Response(
            {'error': 'Todos os campos são obrigatórios'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar se nova senha e confirmação coincidem
    if new_password != confirm_password:
        return Response(
            {'error': 'Nova senha e confirmação não coincidem'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar senha atual
    if not user.check_password(current_password):
        return Response(
            {'error': 'Senha atual incorreta'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar força da nova senha (opcional)
    if len(new_password) < 8:
        return Response(
            {'error': 'A nova senha deve ter pelo menos 8 caracteres'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Alterar senha
    try:
        user.set_password(new_password)
        user.save()
        
        # Atualizar token (opcional - força re-login)
        # Token.objects.filter(user=user).delete()
        # new_token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Senha alterada com sucesso'
        })
        
    except Exception as e:
        return Response(
            {'error': 'Erro interno ao alterar senha'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

# VIEW BUSCAR USUÁRIOS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    Busca usuários por username, nome ou email
    """
    query = request.query_params.get('q', '').strip()
    
    if not query or len(query) < 2:
        return Response(
            {'error': 'Forneça pelo menos 2 caracteres para busca'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Busca em username, first_name, last_name e email
    users = CustomUser.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    ).exclude(id=request.user.id)  # Exclui o próprio usuário
    
    serializer = UserProfileSerializer(users, many=True, context={'request': request})
    
    return Response({
        'query': query,
        'count': users.count(),
        'results': serializer.data
    })