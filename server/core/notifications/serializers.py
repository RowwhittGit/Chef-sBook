# Enhanced serializers.py
from rest_framework import serializers
from .models import Notification
from accounts.models import User

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture']

# For received notifications (hide recipient info)
class NotificationSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'message', 'url', 'notification_type', 'created_at', 'is_read']

# For sent notifications with smart recipient handling
class SentNotificationSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    recipient = serializers.SerializerMethodField()
    recipient_count = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'recipient', 'recipient_count', 'message', 'url', 'notification_type', 'created_at', 'is_read']

    def get_recipient(self, obj):
        # Only show recipient details for personal notifications
        if obj.notification_type == 'personal':
            return UserMiniSerializer(obj.recipient).data
        return None

    def get_recipient_count(self, obj):
        # Show count for global/followers, 1 for personal
        if obj.notification_type in ['global', 'followers']:
            # Count how many people received this notification (same message, type, timestamp)
            return Notification.objects.filter(
                sender=obj.sender,
                message=obj.message,
                notification_type=obj.notification_type,
                created_at=obj.created_at
            ).count()
        return 1