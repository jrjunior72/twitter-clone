# Em users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# # ✅ COMENTE TEMPORARIAMENTE para fazer as migrações iniciais

class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.username

# #     @property
# #     def followers_count(self):
# #         return self.followers.count()

# #     @property
# #     def following_count(self):
# #         return self.following.count()


# 🏷️ 1. SISTEMA DE SEGUIR USUÁRIOS
# 🏷️ USANDO O MODELO RELATIONSHIP EXISTENTE

def follow(self, user):
    """Seguir um usuário"""
    from relationships.models import Relationship  # Import aqui para evitar circular imports
    if self != user and not Relationship.objects.filter(follower=self, followed=user).exists():
        Relationship.objects.create(follower=self, followed=user)
        return True
    return False

def unfollow(self, user):
    """Deixar de seguir um usuário"""
    from relationships.models import Relationship
    try:
        relationship = Relationship.objects.get(follower=self, followed=user)
        relationship.delete()
        return True
    except Relationship.DoesNotExist:
        return False

def is_following(self, user):
    """Verificar se está seguindo um usuário"""
    from relationships.models import Relationship
    return Relationship.objects.filter(follower=self, followed=user).exists()

def get_followers_count(self):
    """Quantidade de seguidores"""
    return self.followers.count()  # related_name='followers' no Relationship

def get_following_count(self):
    """Quantidade de pessoas que segue"""
    return self.following.count()  # related_name='following' no Relationship

# Adicione estes métodos ao modelo CustomUser
CustomUser.add_to_class('follow', follow)
CustomUser.add_to_class('unfollow', unfollow)
CustomUser.add_to_class('is_following', is_following)
CustomUser.add_to_class('get_followers_count', get_followers_count)
CustomUser.add_to_class('get_following_count', get_following_count)