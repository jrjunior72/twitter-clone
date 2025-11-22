# # Em users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models


# # ✅ COMENTE TEMPORARIAMENTE para fazer as migrações iniciais

class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
#     location = models.CharField(max_length=100, blank=True)
#     website = models.URLField(blank=True)
#     birth_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.username

# #     @property
# #     def followers_count(self):
# #         return self.followers.count()

# #     @property
# #     def following_count(self):
# #         return self.following.count()