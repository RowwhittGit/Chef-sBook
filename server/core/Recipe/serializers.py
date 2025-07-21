# RecipePost/serializers.py

from rest_framework import serializers
from .models import Recipe

class RecipeSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')  # show author's username

    class Meta:
        model = Recipe
        fields = [
            'id',
            'title',
            'description',
            'image',
            'ingredients',
            'steps',
            'tags',
            'author',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
