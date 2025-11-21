# users/views.py

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from .models import CustomUser

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


# ⬇️⬇️⬇️ ADICIONE ESTA CLASSE NO FINAL ⬇️⬇️⬇️
class UserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Exclui o próprio usuário da lista
        return CustomUser.objects.exclude(id=self.request.user.id)