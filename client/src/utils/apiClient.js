import axios from "axios"
import useAuthStore from "../stores/authStore"

const API_BASE_URL = "http://127.0.0.1:8000/api"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Get the latest token from the store
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log("Token expired or invalid, clearing auth state")
      useAuthStore.getState().clearTokens()

      // Optionally redirect to login
      // window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// API functions
export const recipeAPI = {
  // Get all recipes with pagination
  getAllRecipes: (page = 1) => apiClient.get(`/posts/all/?page=${page}`),

  // Get single recipe
  getRecipe: (id) => apiClient.get(`/posts/${id}/`),

  // Like/unlike a post
  toggleLike: (postId) => apiClient.post(`/likes/posts/${postId}/like/`),

  // Add comment to post
  addComment: (postId, content) => apiClient.post(`/comments/posts/${postId}/comments/`, { content }),

  // Get comments for a post
  getComments: (postId) => apiClient.get(`/comments/posts/${postId}/comments/`),

  // Search recipes
  searchRecipes: (query) => apiClient.get(`/posts/search/?q=${query}`),

  // Filter by category
  getRecipesByCategory: (categoryId) => apiClient.get(`/posts/category/${categoryId}/`),
}

export default apiClient
