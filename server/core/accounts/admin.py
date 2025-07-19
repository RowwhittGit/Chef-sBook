from django.contrib import admin
from .models import Account
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

class AccountAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff')
    search_fields = ('email', 'username')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'address', 'dob', 'image')}),
    )

admin.site.register(Account, AccountAdmin)
