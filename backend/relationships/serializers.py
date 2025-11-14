from rest_framework import serializers
from .models import Relationship
from users.serializers import UserProfileSerializer

class RelationshipSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer(read_only=True)
    followed = UserProfileSerializer(read_only=True)

    class Meta:
        model = Relationship
        fields = '__all__'
        read_only_fields = ('follower', 'created_at')