from django.db import models

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('global', 'Global'),
        ('followers', 'Followers Only'),
        ('personal', 'Personal'),
    )

    sender = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    recipient = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')  # optional for global
    message = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='personal')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.notification_type} - {self.message}"

