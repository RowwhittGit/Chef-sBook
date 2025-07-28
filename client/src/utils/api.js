import axios from "axios"

const API_BASE_URL = "http://127.0.0.1:8000/"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = useAuthStore((state) => state.accessToken);
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// API functions
export const recipeAPI = {
  // Get all recipes with pagination
  getAllRecipes: (page = 1) => api.get(`/posts/all/?page=${page}`),

  // Get single recipe
  getRecipe: (id) => api.get(`/posts/${id}/`),

  // Like/unlike a post
  toggleLike: (postId) => api.post(`/likes/posts/${postId}/like/`),

  // Add comment to post
  addComment: (postId, content) => api.post(`/comments/posts/${postId}/comments/`, { content }),

  // Get comments for a post
  getComments: (postId) => api.get(`/comments/posts/${postId}/comments/`),

  // Search recipes
  searchRecipes: (query) => api.get(`/posts/search/?q=${query}`),

  // Filter by category
  getRecipesByCategory: (categoryId) => api.get(`/posts/category/${categoryId}/`),
}

export default api
