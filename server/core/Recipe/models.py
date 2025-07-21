# RecipePost/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Recipe(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    ingredients = models.TextField(help_text="List ingredients, separated by commas or line breaks.")
    steps = models.TextField(help_text="Step-by-step instructions.")
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags like 'vegan, dessert'")
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
