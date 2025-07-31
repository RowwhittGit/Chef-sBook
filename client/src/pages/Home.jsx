"use client"

import { useEffect, useState, useMemo } from "react"
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
  const clearSelectedCategory = useCategoryStore((state) => state.clearSelectedCategory)
  const [allRecipes, setAllRecipes] = useState([]) // Store ALL recipes
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })

  const { user: currentUser, fetchProfile } = useProfileStore()
  const accessToken = useAuthStore((state) => state.accessToken)

  // Filter recipes based on selected category
  const filteredRecipes = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") {
      return allRecipes // Show all recipes if no filter or "All" selected
    }
    
    return allRecipes.filter(recipe => 
      recipe.category && recipe.category.name === selectedCategory
    )
  }, [allRecipes, selectedCategory])

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

        const [postsResponse, savedResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/posts/all/"),
          accessToken
            ? axios.get("http://127.0.0.1:8000/api/posts/saved/", {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              })
            : Promise.resolve({ data: { results: [] } }),
        ])

        const postData = postsResponse.data
        const savedPostIds = savedResponse.data.results.map((entry) => entry.post.id)

        const updatedRecipes = postData.results.map((recipe) => ({
          ...recipe,
          is_saved: savedPostIds.includes(recipe.id),
        }))

        setAllRecipes(updatedRecipes) // Store all recipes
        setPagination({
          count: postData.count,
          next: postData.next,
          previous: postData.previous,
        })
      } catch (error) {
        console.error("Failed to fetch recipes:", error)
        setError("Failed to load recipes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [accessToken]) // Remove selectedCategory from dependency array

  const handleRecipeUpdate = (updatedRecipe) => {
    console.log("Updating recipe:", updatedRecipe)
    setAllRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    )
  }

  const loadMoreRecipes = async () => {
    if (!pagination.next || (selectedCategory && selectedCategory !== "All")) return // Don't load more when filtering

    try {
      const [nextPostsRes, savedResponse] = await Promise.all([
        axios.get(pagination.next),
        accessToken
          ? axios.get("http://127.0.0.1:8000/api/posts/saved/", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
          : Promise.resolve({ data: { results: [] } }),
      ])

      const savedPostIds = savedResponse.data.results.map((entry) => entry.post.id)

      const newRecipes = nextPostsRes.data.results.map((recipe) => ({
        ...recipe,
        is_saved: savedPostIds.includes(recipe.id),
      }))

      setAllRecipes((prevRecipes) => [...prevRecipes, ...newRecipes])
      setPagination({
        count: nextPostsRes.data.count,
        next: nextPostsRes.data.next,
        previous: nextPostsRes.data.previous,
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedCategory && selectedCategory !== "All" ? `${selectedCategory} Recipes` : "Discover Amazing Recipes"}
          </h2>
          <p className="text-gray-600">
            Showing {filteredRecipes.length} of {selectedCategory && selectedCategory !== "All" ? filteredRecipes.length : pagination.count} recipes
            {selectedCategory && selectedCategory !== "All" && (
              <span className="text-orange-600 font-medium"> in {selectedCategory}</span>
            )}
          </p>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold mb-2">
              {selectedCategory && selectedCategory !== "All"
                ? `No ${selectedCategory} recipes found`
                : "No recipes found"
              }
            </h3>
            <p className="text-gray-400">
              {selectedCategory && selectedCategory !== "All"
                ? `We don't have any ${selectedCategory} recipes yet. Try exploring other categories!`
                : "Try adjusting your filters or check back later for new recipes."
              }
            </p>
            {selectedCategory && selectedCategory !== "All" && (
              <button
                onClick={clearSelectedCategory}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                View All Recipes
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-8 justify-center">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onRecipeUpdate={handleRecipeUpdate}
                  currentUser={currentUser}
                />
              ))}
            </div>

            {/* Hide load more button when filtering since we show all matching results */}
            {(!selectedCategory || selectedCategory === "All") && pagination.next && (
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