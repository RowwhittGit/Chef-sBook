# project/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/recipe/', include('Recipe.urls')),  # All auth routes now under /api/auth/
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)