from django.urls import path
from .views import (
    RecipeListView,
    RecipeCreateView,
    RecipeDetailView,
    RecipeUpdateView,
    RecipeDeleteView,
)

urlpatterns = [
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),           # GET all recipes
    path('recipes/create/', RecipeCreateView.as_view(), name='recipe-create'), # POST new recipe
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'), # GET one recipe by id
    path('recipes/<int:pk>/update/', RecipeUpdateView.as_view(), name='recipe-update'), # PUT/PATCH to update
    path('recipes/<int:pk>/delete/', RecipeDeleteView.as_view(), name='recipe-delete'), # DELETE
]
