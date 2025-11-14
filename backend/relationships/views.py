# relationships/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Relationship
from .serializers import RelationshipSerializer
from users.models import CustomUser

@api_view(['POST'])
def follow_user(request, username):
    user_to_follow = get_object_or_404(CustomUser, username=username)
    
    if request.user == user_to_follow:
        return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    relationship, created = Relationship.objects.get_or_create(
        follower=request.user,
        followed=user_to_follow
    )
    
    if not created:
        relationship.delete()
        return Response({'following': False}, status=status.HTTP_200_OK)
    
    serializer = RelationshipSerializer(relationship)
    return Response({'following': True, 'relationship': serializer.data}, status=status.HTTP_201_CREATED)

class FollowingListView(generics.ListAPIView):
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Relationship.objects.filter(follower=self.request.user)

class FollowersListView(generics.ListAPIView):
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Relationship.objects.filter(followed=self.request.user)