from django.urls import path

from .views import (
    PushNotificationView,
    NotificationListView,
    GlobalNotificationListView,
    FollowersNotificationListView,
    PersonalNotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    SentNotificationListView,
)



urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    path('push/', PushNotificationView.as_view(), name='push-notification'),
    path('global/', GlobalNotificationListView.as_view(), name='global-notifications'),
    path('followers/', FollowersNotificationListView.as_view(), name='followers-notifications'),
    path('personal/', PersonalNotificationListView.as_view(), name='personal-notifications'),
    path('sent/', SentNotificationListView.as_view(), name='sent-notifications'),
]
