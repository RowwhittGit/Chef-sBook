"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { CiBookmark, CiHeart } from "react-icons/ci"
import { FaHeart, FaBookmark, FaStar } from "react-icons/fa"
import { IoChatboxOutline } from "react-icons/io5"
import { RiShareForwardFill } from "react-icons/ri"
import { MdReviews } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import useProfileStore from "../stores/ProfileStore"
import useToastStore from "../stores/toastStore"
import { SlUserFollow } from "react-icons/sl";
import { SlUserUnfollow } from "react-icons/sl";

const RecipeCard = ({ recipe, onRecipeUpdate, currentUser }) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const { showSuccess, showError, showWarning } = useToastStore()
  const [showComments, setShowComments] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRating, setIsRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const navigate = useNavigate()
  
  // Follow/Unfollow states
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [chefProfile, setChefProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch chef profile on component mount
  useEffect(() => {
    if (recipe.user?.id) {
      fetchChefProfile()
    }
  }, [recipe.user?.id])

  const fetchChefProfile = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/auth/users/${recipe.user.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setChefProfile(response.data)

      // Check if current user is following this chef
      if (currentUser) {
        const isCurrentlyFollowing = response.data.followers.some(
          (follower) => follower.follower === currentUser.id
        )
        setIsFollowing(isCurrentlyFollowing)
      }
    } catch (error) {
      console.error("Error fetching chef profile:", error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleFollow = async () => {
    if (!chefProfile || isFollowLoading || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to follow chefs")
      }
      return
    }

    setIsFollowLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `http://127.0.0.1:8000/api/auth/unfollow/${chefProfile.id}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        )
        setIsFollowing(false)
        // Update follower count optimistically
        setChefProfile((prev) => ({
          ...prev,
          follower_count: prev.follower_count - 1,
        }))
        showSuccess("Unfollowed successfully")
      } else {
        // Follow
        await axios.post(
          `http://127.0.0.1:8000/api/auth/follow/${chefProfile.id}/`,
          { following: chefProfile.id },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        )
        setIsFollowing(true)
        // Update follower count optimistically
        setChefProfile((prev) => ({
          ...prev,
          follower_count: prev.follower_count + 1,
        }))
        showSuccess("Following successfully! 👨‍🍳")
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error)
      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else {
        showError("Failed to update follow status. Please try again.")
      }
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleRecipeClick = () => {
    navigate(`/post/${recipe.id}`)
  }

  const handleLike = async () => {
    if (isLiking || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to like posts")
      }
      return
    }

    setIsLiking(true)

    // Get current user info
    const user = currentUser || useProfileStore.getState().user

    if (!user) {
      showError("User information not available. Please refresh and try again.")
      setIsLiking(false)
      return
    }

    // Check if user already liked this post
    const isCurrentlyLiked = recipe.likes?.some((like) => like.user.id === user.id)

    // OPTIMISTIC UPDATE - Update UI immediately
    let optimisticRecipe
    if (isCurrentlyLiked) {
      // Remove like optimistically
      optimisticRecipe = {
        ...recipe,
        likes: recipe.likes.filter((like) => like.user.id !== user.id),
      }
    } else {
      // Add like optimistically
      const newLike = {
        id: Date.now(), // Temporary ID
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          profile_picture: user.profile_picture,
        },
        post: recipe.id,
        created_at: new Date().toISOString(),
      }
      optimisticRecipe = {
        ...recipe,
        likes: [...(recipe.likes || []), newLike],
      }
    }

    // Update UI immediately
    onRecipeUpdate(optimisticRecipe)

    try {
      let response
      if (isCurrentlyLiked) {
        // Unlike the post - use DELETE method
        response = await axios.delete(`http://127.0.0.1:8000/api/likes/posts/${recipe.id}/like/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        // Like the post - use POST method
        response = await axios.post(
          `http://127.0.0.1:8000/api/likes/posts/${recipe.id}/like/`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
      }

      console.log("Like/Unlike API Response:", response.data)

      // Handle different possible API response formats
      let finalRecipe = { ...recipe }

      if (response.data.likes) {
        // If API returns the full likes array
        finalRecipe.likes = response.data.likes
      } else if (response.data.liked !== undefined) {
        // If API returns a boolean indicating like status
        if (response.data.liked && !isCurrentlyLiked) {
          // User just liked the post
          const newLike = {
            id: response.data.like_id || Date.now(),
            user: {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              profile_picture: user.profile_picture,
            },
            post: recipe.id,
            created_at: new Date().toISOString(),
          }
          finalRecipe.likes = [...(recipe.likes || []), newLike]
          showSuccess("Recipe liked! ❤️")
        } else if (!response.data.liked && isCurrentlyLiked) {
          // User just unliked the post
          finalRecipe.likes = recipe.likes.filter((like) => like.user.id !== user.id)
          showSuccess("Recipe unliked")
        }
      } else {
        // If API doesn't return specific format, keep optimistic update
        finalRecipe = optimisticRecipe
        showSuccess(isCurrentlyLiked ? "Recipe unliked" : "Recipe liked! ❤️")
      }

      // Update with final data from server
      onRecipeUpdate(finalRecipe)
    } catch (error) {
      console.error("Failed to like/unlike post:", error)

      // REVERT OPTIMISTIC UPDATE on error
      onRecipeUpdate(recipe)

      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else {
        showError("Failed to update like. Please try again.")
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (isSaving || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to save posts")
      }
      return
    }

    setIsSaving(true)

    // Get current user info
    const user = currentUser || useProfileStore.getState().user

    if (!user) {
      showError("User information not available. Please refresh and try again.")
      setIsSaving(false)
      return
    }

    // Check if user already saved this post (you might need to add this to your recipe data structure)
    const isCurrentlySaved = recipe.is_saved || false

    // OPTIMISTIC UPDATE - Update UI immediately
    const optimisticRecipe = {
      ...recipe,
      is_saved: !isCurrentlySaved,
    }

    // Update UI immediately
    onRecipeUpdate(optimisticRecipe)

    try {
      let response
      if (isCurrentlySaved) {
        // Unsave the post
        response = await axios.post(
          `http://127.0.0.1:8000/api/posts/unsave/${recipe.id}/`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
      } else {
        // Save the post
        response = await axios.post(
          `http://127.0.0.1:8000/api/posts/save/${recipe.id}/`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
      }

      console.log("Save/Unsave API Response:", response.data)

      // Handle API response
      const finalRecipe = {
        ...recipe,
        is_saved: response.data.saved !== undefined ? response.data.saved : !isCurrentlySaved,
      }

      onRecipeUpdate(finalRecipe)
      showSuccess(isCurrentlySaved ? "Recipe removed from saved" : "Recipe saved! 📌")
    } catch (error) {
      console.error("Failed to save/unsave post:", error)

      // REVERT OPTIMISTIC UPDATE on error
      onRecipeUpdate(recipe)

      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else {
        showError("Failed to save recipe. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRating = async () => {
    if (!selectedRating || isRating || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to rate posts")
        return
      }
      if (!selectedRating) {
        showWarning("Please select a rating")
        return
      }
    }

    setIsRating(true)

    try {
      console.log("Sending rating request:", {
        postId: recipe.id,
        rating: selectedRating,
        accessToken: accessToken ? "Present" : "Missing",
      })

      const response = await axios.post(
        `http://127.0.0.1:8000/api/ratings/posts/${recipe.id}/rate/`,
        {
          rating_value: Number.parseInt(selectedRating),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      console.log("Rating API Response:", response.data)

      // Update the recipe with new average rating
      const updatedRecipe = {
        ...recipe,
        average_rating: response.data.average_rating || selectedRating,
      }

      onRecipeUpdate(updatedRecipe)
      showSuccess(`Recipe rated ${selectedRating} star${selectedRating > 1 ? "s" : ""}! ⭐`)
      setShowRatingModal(false)
      setSelectedRating(0)
    } catch (error) {
      console.error("Failed to rate post:", error)
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })

      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || "Invalid rating data"
        showError(`Rating failed: ${errorMessage}`)
      } else {
        showError("Failed to rate recipe. Please try again.")
      }
    } finally {
      setIsRating(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isCommenting || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to comment")
      }
      return
    }

    setIsCommenting(true)

    const user = currentUser || useProfileStore.getState().user

    if (!user) {
      showError("User information not available. Please refresh and try again.")
      setIsCommenting(false)
      return
    }

    // OPTIMISTIC UPDATE - Add comment immediately
    const optimisticComment = {
      id: Date.now(), // Temporary ID
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        profile_picture: user.profile_picture,
      },
      post: recipe.id,
      content: newComment,
      created_at: new Date().toISOString(),
    }

    const optimisticRecipe = {
      ...recipe,
      comments: [...(recipe.comments || []), optimisticComment],
    }

    // Update UI immediately
    onRecipeUpdate(optimisticRecipe)
    const commentText = newComment
    setNewComment("") // Clear input immediately

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comments/posts/${recipe.id}/comments/`,
        {
          content: commentText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      console.log("Comment API Response:", response.data)

      // Replace optimistic comment with real comment from server
      const finalRecipe = {
        ...recipe,
        comments: [...recipe.comments, response.data],
      }

      onRecipeUpdate(finalRecipe)
      showSuccess("Comment added! 💬")
    } catch (error) {
      console.error("Failed to add comment:", error)

      // REVERT OPTIMISTIC UPDATE on error
      onRecipeUpdate(recipe)
      setNewComment(commentText) // Restore the comment text

      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else {
        showError("Failed to add comment. Please try again.")
      }
    } finally {
      setIsCommenting(false)
    }
  }

  const toggleComment = () => {
    setShowComments(!showComments)
  }

  const toggleLikes = () => {
    setShowLikes(!showLikes)
  }

  const openRatingModal = () => {
    if (!accessToken) {
      showWarning("Please log in to rate posts")
      return
    }
    setShowRatingModal(true)
  }

  const closeRatingModal = () => {
    setShowRatingModal(false)
    setSelectedRating(0)
  }

  const formatTime = (timeString) => {
    if (!timeString) return "30 min"
    return timeString.replace("00:", "") + " min"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if current user has liked this post
  const user = currentUser || useProfileStore.getState().user
  const isLikedByUser = user && recipe.likes?.some((like) => like.user.id === user.id)
  const isSavedByUser = recipe.is_saved || false

  return (
    <div className="relative">
      <div
        className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col sm:max-w-[400px] max-w-[300px] ${
          showComments || showLikes ? "h-auto min-h-[750px]" : "h-[550px]"
        }`}
      >
        <div className="relative">
          <img
            src={recipe.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836"}
            alt={recipe.title || "Recipe"}
            className="w-full h-56 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={handleRecipeClick}
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !accessToken}
              className={`w-12 h-12 flex items-center justify-center shadow-lg rounded-full cursor-pointer group transition-all duration-200 ${
                isSavedByUser
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-yellow-600"
              } ${!accessToken ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : isSavedByUser ? (
                <FaBookmark className="text-xl" />
              ) : (
                <CiBookmark className="text-2xl" />
              )}
              <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">
                {isSavedByUser ? "Remove from Saved" : "Save Recipe"}
              </div>
            </button>
          </div>

          {/* Difficulty Badge */}
          {recipe.difficulty && (
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  recipe.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : recipe.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          {/* Chef Profile Section with Follow Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={recipe.user.profile_picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Chef"
                className="w-9 h-9 rounded-full object-cover border-2 border-white cursor-pointer shadow"
              />
              <div>
                <span className="font-semibold text-gray-800 text-sm block">
                  {recipe.user.username}
                </span>
                {chefProfile && (
                  <span className="text-xs text-gray-500">
                    {chefProfile.follower_count} followers
                  </span>
                )}
              </div>
            </div>
            
            {/* Follow/Unfollow Button */}
            {currentUser?.id !== recipe.user?.id && (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading || !accessToken}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                  isFollowing
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                    : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 shadow-md"
                } ${isFollowLoading || !accessToken ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isFollowLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : isFollowing ? (
                  <>
                    <SlUserUnfollow className="text-xs" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <SlUserFollow className="text-xs" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Serving and Time Info */}
          <div className="flex items-center gap-4 mb-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(recipe.estimated_time)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {recipe.servings || 1} servings
            </span>
          </div>

          <h3
            className="text-lg font-bold text-red-700 mb-1 cursor-pointer hover:text-red-800 transition-colors"
            onClick={handleRecipeClick}
          >
            {recipe.title || "Untitled Recipe"}
          </h3>
          <p className="text-gray-600 mb-3 text-sm line-clamp-3">{recipe.content || "No description available."}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.difficulty && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                {recipe.difficulty}
              </span>
            )}
            {recipe.ingredients && (
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                {recipe.category?.name || 'Not mentioned'}
              </span>
            )}
          </div>

          {/* Authentication Status Indicator */}
          {!accessToken && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 text-center">
                Please log in to like, comment, save, and rate recipes
              </p>
            </div>
          )}

          {/* Likes Section */}
          {showLikes && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaHeart className="text-lg text-red-600" />
                Liked by ({recipe.likes?.length || 0})
              </h4>

              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {recipe.likes?.length > 0 ? (
                  recipe.likes.map((like) => (
                    <div key={like.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <img
                        src={like.user.profile_picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        alt={like.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-800">{like.user.full_name || like.user.username}</p>
                        <p className="text-xs text-gray-500">@{like.user.username}</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-auto">{formatDate(like.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No likes yet. Be the first to like!</p>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Comments ({recipe.comments?.length || 0})</h4>
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {recipe.comments?.length > 0 ? (
                  recipe.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={
                            comment.user?.profile_picture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={comment.user?.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <p className="font-medium text-sm text-gray-800">
                          {comment.user?.full_name || comment.user?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                      </div>
                      <p className="text-gray-700 text-sm ml-8">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {accessToken && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                  />
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCommentSubmit}
                    disabled={isCommenting || !newComment.trim()}
                  >
                    {isCommenting ? "Posting..." : "Post"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex gap-4">
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 ${
                  isLikedByUser ? "text-red-600 scale-105" : "text-gray-500 hover:text-red-600"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""} ${!accessToken ? "opacity-50" : ""}`}
                onClick={handleLike}
                disabled={isLiking || !accessToken}
              >
                {isLiking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                ) : isLikedByUser ? (
                  <FaHeart className="text-xl animate-pulse" />
                ) : (
                  <CiHeart className="text-3xl" />
                )}
                <span onClick={toggleLikes} className="cursor-pointer hover:underline">
                  {recipe.likes?.length || 0}
                </span>
              </button>
              <button
                className="flex items-center gap-1 text-gray-500 hover:text-yellow-600 text-sm font-medium"
                onClick={toggleComment}
              >
                <IoChatboxOutline className="text-2xl" /> {recipe.comments?.length || 0}
              </button>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-green-500">
                <RiShareForwardFill className="text-2xl" /> Share
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors ${!accessToken ? "opacity-50" : ""}`}
                onClick={openRatingModal}
                disabled={!accessToken}
              >
                <MdReviews className="text-lg" />
                {recipe.average_rating && recipe.average_rating > 0 && (
                  <span className="text-xs text-gray-600 font-medium">{recipe.average_rating.toFixed(1)}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Absolute Positioned Rating Modal */}
      {showRatingModal && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-80">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Rate this Recipe</h3>
              <p className="text-gray-600 text-sm mb-6">How would you rate this recipe?</p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="transition-all duration-200 hover:scale-110"
                    onClick={() => setSelectedRating(star)}
                  >
                    <FaStar className={`text-3xl ${star <= selectedRating ? "text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>

              {/* Rating Text */}
              {selectedRating > 0 && (
                <p className="text-sm text-gray-600 mb-6">
                  {selectedRating} star{selectedRating > 1 ? "s" : ""} selected
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeRatingModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRating}
                  disabled={!selectedRating || isRating}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRating ? "Rating..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeCard