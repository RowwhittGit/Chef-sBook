"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../components/Header"
import useCategoryStore from "../stores/categoryStore"
import Filters from "../components/Filters"
import RecipeCard from "../components/RecipeCard"
import useAuthStore from "../stores/authStore"
import useProfileStore from "../stores/ProfileStore"
import ToastContainer from "../components/ToastContainer"

function Home() {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })

  // Get current user from profile store
  const { user: currentUser, fetchProfile } = useProfileStore()
  const accessToken = useAuthStore((state) => state.accessToken)

  // Fetch user profile if we have a token but no user data
  useEffect(() => {
    if (accessToken && !currentUser) {
      fetchProfile()
    }
  }, [accessToken, currentUser, fetchProfile])

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get("http://127.0.0.1:8000/api/posts/all/")
        const data = response.data

        console.log("API Response:", data) // Debug log

        setRecipes(data.results)
        // If you have an endpoint to check saved status, you can call it here
        // For now, we'll assume the API returns is_saved field with each recipe
        // If not, you might need to fetch saved recipes separately

        setRecipes(
          data.results.map((recipe) => ({
            ...recipe,
            is_saved: recipe.is_saved || false, // Ensure is_saved field exists
          })),
        )
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        })
      } catch (error) {
        console.error("Failed to fetch recipes:", error)
        setError("Failed to load recipes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [selectedCategory])

  const handleRecipeUpdate = (updatedRecipe) => {
    console.log("Updating recipe:", updatedRecipe) // Debug log
    setRecipes((prevRecipes) => prevRecipes.map((recipe) => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe)))
  }

  const loadMoreRecipes = async () => {
    if (!pagination.next) return

    try {
      const response = await axios.get(pagination.next)
      const data = response.data

      setRecipes((prevRecipes) => [...prevRecipes, ...data.results])
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      })
    } catch (error) {
      console.error("Failed to load more recipes:", error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen py-3 px-10 lg:px-20">
        <Header />
        <Filters />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen py-3 px-10 lg:px-20">
        <Header />
        <Filters />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen py-3 px-10 lg:px-20">
      <Header />
      <Filters />

      <div className="max-w-full mx-auto mt-8">
        {/* Recipe Stats */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Discover Amazing Recipes</h2>
          <p className="text-gray-600">
            Showing {recipes.length} of {pagination.count} recipes
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for new recipes.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-8 justify-center">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onRecipeUpdate={handleRecipeUpdate}
                  currentUser={currentUser}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.next && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreRecipes}
                  className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors font-medium"
                >
                  Load More Recipes
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default Home
