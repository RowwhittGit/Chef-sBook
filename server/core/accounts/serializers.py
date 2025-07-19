from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        from .models import Account  # Local import to prevent circular dependency
        model = Account
        fields = [
            'email', 'password', 'password2',
            'first_name', 'last_name', 'address',
            'username', 'dob', 'image'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'dob': {'required': False},
            'image': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        try:
            validated_data.pop('password2')
            image = validated_data.pop('image', None)
            user = self.Meta.model.objects.create_user(**validated_data)
            if image:
                user.image = image
                user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class ProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        from .models import Account
        model = Account
        fields = [
            'id', 'email', 'username',
            'first_name', 'last_name', 'full_name',
            'address', 'dob', 'age', 'image',
            'date_joined', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'date_joined', 'last_login'
        ]
        extra_kwargs = {
            'image': {'required': False},
            'dob': {'required': False},
        }

    def get_age(self, obj):
        if obj.dob:
            today = timezone.now().date()
            return today.year - obj.dob.year - (
                (today.month, today.day) < (obj.dob.month, obj.dob.day))
        return None

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()