from rest_framework import serializers
from .models import Notification
from accounts.models import User

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture']

class NotificationSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'created_at', 'is_read']

