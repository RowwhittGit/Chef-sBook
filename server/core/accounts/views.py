from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, ProfileSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    pass  # Uses default JWT behavior

class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    
    def get_object(self):
        return self.request.user  # Automatically gets logged-in user