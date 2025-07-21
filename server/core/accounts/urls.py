from django.urls import path
from .views import RegisterView, LoginView, ProfileView, UpdateProfileView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('profile/update/', UpdateProfileView.as_view()),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)