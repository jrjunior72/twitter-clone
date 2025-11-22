# users/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(use_url=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile_picture', 'bio', 'followers_count', 'following_count', 'is_following'
        )

    def get_followers_count(self, obj):
        """Retorna a quantidade de seguidores"""
        return obj.get_followers_count()
    
    def get_following_count(self, obj):
        """Retorna a quantidade de pessoas que o usuário segue"""
        return obj.get_following_count()
    
    def get_is_following(self, obj):
        """Verifica se o usuário da requisição está seguindo este usuário"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Evita verificar se é o próprio usuário
            if request.user != obj:
                return request.user.is_following(obj)
        return False