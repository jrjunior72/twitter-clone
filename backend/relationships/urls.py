# posts/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('follow/<str:username>/', views.follow_user, name='follow-user'),
    path('following/', views.FollowingListView.as_view(), name='following-list'),
    path('followers/', views.FollowersListView.as_view(), name='followers-list'),
]