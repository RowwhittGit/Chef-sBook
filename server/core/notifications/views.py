# views.py - Complete with all necessary imports
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from .models import Notification
from .serializers import NotificationSerializer, SentNotificationSerializer
from accounts.models import User, Follower

class PushNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        url = request.data.get('url')
        notif_type = request.data.get('notification_type')  # 'global', 'followers', 'personal'
        recipient_id = request.data.get('recipient')  # used only for personal
        sender = request.user

        if not message or not notif_type:
            return Response({'error': 'message and notification_type are required.'}, status=status.HTTP_400_BAD_REQUEST)

        notifications = []

        if notif_type == 'global':
            users = User.objects.exclude(id=sender.id)
        elif notif_type == 'followers':
            # Get all users who are following the sender
            follower_ids = Follower.objects.filter(following=sender).values_list('follower', flat=True)
            users = User.objects.filter(id__in=follower_ids)
        elif notif_type == 'personal':
            if not recipient_id:
                return Response({'error': 'Recipient is required for personal notifications.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return Response({'error': 'Recipient not found.'}, status=status.HTTP_404_NOT_FOUND)
            users = [recipient]
        else:
            return Response({'error': 'Invalid notification type.'}, status=status.HTTP_400_BAD_REQUEST)

        for user in users:
            notification = Notification.objects.create(
                sender=sender,
                recipient=user,
                message=message,
                url=url,
                notification_type=notif_type
            )
            notifications.append(NotificationSerializer(notification).data)

        return Response(notifications, status=status.HTTP_201_CREATED)

# List ALL notifications for the authenticated user
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-created_at')

# List GLOBAL notifications for the authenticated user
class GlobalNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            recipient=user,
            notification_type='global'
        ).order_by('-created_at')

# List FOLLOWERS notifications for the authenticated user
class FollowersNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            recipient=user,
            notification_type='followers'
        ).order_by('-created_at')

# List PERSONAL notifications for the authenticated user
class PersonalNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            recipient=user,
            notification_type='personal'
        ).order_by('-created_at')

# List SENT notifications for the authenticated user
class SentNotificationListView(generics.ListAPIView):
    serializer_class = SentNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(sender=user).order_by('-created_at')

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        notification.is_read = True
        notification.save()
        serializer = NotificationSerializer(notification)
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            'notification': serializer.data,
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)
    
class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        unread_notifications = Notification.objects.filter(recipient=request.user, is_read=False)
        unread_notifications.update(is_read=True)
        return Response({'message': 'All notifications marked as read.'}, status=status.HTTP_200_OK)