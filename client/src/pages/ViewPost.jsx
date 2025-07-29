"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import Header from "../components/Header"
import Filters from "../components/Filters"
import { CiHeart, CiBookmark } from "react-icons/ci"
import { FaHeart, FaBookmark, FaStar } from "react-icons/fa"
import { IoChatboxOutline } from "react-icons/io5"
import { MdReviews } from "react-icons/md"
import useAuthStore from "../stores/authStore"
import useProfileStore from "../stores/ProfileStore"
import useToastStore from "../stores/toastStore"

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const accessToken = useAuthStore((state) => state.accessToken)
  const { showSuccess, showError, showWarning } = useToastStore()

  // Interactive states
  const [showComments, setShowComments] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRating, setIsRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  // Get current user
  const currentUser = useProfileStore((state) => state.user)


  useEffect(() => {
    setLoading(true)
    axios
      .get(`http://127.0.0.1:8000/api/posts/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setPost(res.data)
        console.log(id)
        console.log(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to fetch post.")
        setLoading(false)
      })
  }, [id, accessToken])

  // Like functionality
  const handleLike = async () => {
    if (isLiking || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to like posts")
      }
      return
    }

    setIsLiking(true)
    const user = currentUser || useProfileStore.getState().user
    if (!user) {
      showError("User information not available. Please refresh and try again.")
      setIsLiking(false)
      return
    }

    // Check if user already liked this post
    const isCurrentlyLiked = post.likes?.some((like) => like.user.id === user.id)

    // OPTIMISTIC UPDATE - Update UI immediately
    let optimisticPost
    if (isCurrentlyLiked) {
      // Remove like optimistically
      optimisticPost = {
        ...post,
        likes: post.likes.filter((like) => like.user.id !== user.id),
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
        post: post.id,
        created_at: new Date().toISOString(),
      }
      optimisticPost = {
        ...post,
        likes: [...(post.likes || []), newLike],
      }
    }

    // Update UI immediately
    setPost(optimisticPost)

    try {
      let response
      if (isCurrentlyLiked) {
        // Unlike the post
        response = await axios.delete(`http://127.0.0.1:8000/api/likes/posts/${post.id}/like/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        // Like the post
        response = await axios.post(
          `http://127.0.0.1:8000/api/likes/posts/${post.id}/like/`,
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
      let finalPost = { ...post }
      if (response.data.likes) {
        finalPost.likes = response.data.likes
      } else if (response.data.liked !== undefined) {
        if (response.data.liked && !isCurrentlyLiked) {
          const newLike = {
            id: response.data.like_id || Date.now(),
            user: {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              profile_picture: user.profile_picture,
            },
            post: post.id,
            created_at: new Date().toISOString(),
          }
          finalPost.likes = [...(post.likes || []), newLike]
          showSuccess("Recipe liked! ❤️")
        } else if (!response.data.liked && isCurrentlyLiked) {
          finalPost.likes = post.likes.filter((like) => like.user.id !== user.id)
          showSuccess("Recipe unliked")
        }
      } else {
        finalPost = optimisticPost
        showSuccess(isCurrentlyLiked ? "Recipe unliked" : "Recipe liked! ❤️")
      }

      setPost(finalPost)
    } catch (error) {
      console.error("Failed to like/unlike post:", error)
      // REVERT OPTIMISTIC UPDATE on error
      setPost(post)
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

  // Save functionality
  const handleSave = async () => {
    if (isSaving || !accessToken) {
      if (!accessToken) {
        showWarning("Please log in to save posts")
      }
      return
    }

    setIsSaving(true)
    const user = currentUser || useProfileStore.getState().user
    if (!user) {
      showError("User information not available. Please refresh and try again.")
      setIsSaving(false)
      return
    }

    const isCurrentlySaved = post.is_saved || false

    // OPTIMISTIC UPDATE
    const optimisticPost = {
      ...post,
      is_saved: !isCurrentlySaved,
    }
    setPost(optimisticPost)

    try {
      let response
      if (isCurrentlySaved) {
        response = await axios.post(
          `http://127.0.0.1:8000/api/posts/unsave/${post.id}/`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
      } else {
        response = await axios.post(
          `http://127.0.0.1:8000/api/posts/save/${post.id}/`,
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
      const finalPost = {
        ...post,
        is_saved: response.data.saved !== undefined ? response.data.saved : !isCurrentlySaved,
      }
      setPost(finalPost)
      showSuccess(isCurrentlySaved ? "Recipe removed from saved" : "Recipe saved! 📌")
    } catch (error) {
      console.error("Failed to save/unsave post:", error)
      setPost(post) // Revert
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

  // Comment functionality
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

    // OPTIMISTIC UPDATE
    const optimisticComment = {
      id: Date.now(),
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        profile_picture: user.profile_picture,
      },
      post: post.id,
      content: newComment,
      created_at: new Date().toISOString(),
    }

    const optimisticPost = {
      ...post,
      comments: [...(post.comments || []), optimisticComment],
    }

    setPost(optimisticPost)
    const commentText = newComment
    setNewComment("")

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/comments/posts/${post.id}/comments/`,
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
      const finalPost = {
        ...post,
        comments: [...post.comments, response.data],
      }
      setPost(finalPost)
      showSuccess("Comment added! 💬")
    } catch (error) {
      console.error("Failed to add comment:", error)
      setPost(post) // Revert
      setNewComment(commentText)
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

  // Rating functionality
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
      const response = await axios.post(
        `http://127.0.0.1:8000/api/ratings/posts/${post.id}/rate/`,
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
      const updatedPost = {
        ...post,
        average_rating: response.data.average_rating || selectedRating,
      }
      setPost(updatedPost)
      showSuccess(`Recipe rated ${selectedRating} star${selectedRating > 1 ? "s" : ""}! ⭐`)
      setShowRatingModal(false)
      setSelectedRating(0)
    } catch (error) {
      console.error("Failed to rate post:", error)
      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.")
        useAuthStore.getState().clearTokens()
      } else {
        showError("Failed to rate recipe. Please try again.")
      }
    } finally {
      setIsRating(false)
    }
  }

  // Helper functions
  const toggleComments = () => {
    setShowComments(!showComments)
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

  if (loading) return <div className="text-center py-12 text-lg">Loading...</div>
  if (error) return <div className="text-center text-red-600 py-12 text-lg">{error}</div>
  if (!post) return null

  // Check if current user has liked this post
  const user = currentUser || useProfileStore.getState().user
  const isLikedByUser = user && post.likes?.some((like) => like.user.id === user.id)
  const isSavedByUser = post.is_saved || false

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-3 px-10 lg:px-20 min-h-screen relative">
      <Header />
      <Filters />

      <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6 relative">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !accessToken}
            className={`absolute top-4 right-4 p-2 w-12 h-12 flex items-center justify-center shadow-lg rounded-full cursor-pointer group transition-all duration-200 bg-white ${
              isSavedByUser ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"
            } ${!accessToken ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isSavedByUser ? "Remove from saved" : "Save recipe"}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black bg-white"></div>
            ) : isSavedByUser ? (
              <FaBookmark className="text-2xl" />
            ) : (
              <CiBookmark className="text-2xl" />
            )}
          </button>

          <img
            src={post.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836"}
            alt={post.title || "Recipe"}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
          <h1 className="text-2xl font-bold text-red-700 mb-2">{post.title || "Untitled Recipe"}</h1>
          <span className="text-gray-500 text-sm mb-2">
            By {post.user?.username || "Chef"} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
          </span>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Description</h2>
          <p className="text-gray-700 text-base">{post.content || "No description available."}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Ingredients</h2>
          <p className="text-gray-700 text-base">{post.ingredients || "No ingredients listed."}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Instructions</h2>
          <p className="text-gray-700 text-base">{post.instructions || "No instructions provided."}</p>
        </div>

        <div className="mb-4 flex gap-4">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
            {post.difficulty || "Difficulty: N/A"}
          </span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
            Servings: {post.servings || "N/A"}
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Time: {post.estimated_time || "N/A"}
          </span>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Notes</h2>
          <p className="text-gray-700 text-base">{post.notes || "No notes."}</p>
        </div>

        {/* Video link div */}
        <div className="my-2">
          <h2 className="font-semibold text-lg mb-1">Video Link</h2>
          {post.video_url ? (
            <a
              href={post.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Watch the full video here
            </a>
          ) : (
            "No video link provided."
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Comments ({post.comments?.length || 0})</h2>
            <button onClick={toggleComments} className="text-sm text-blue-600 hover:text-blue-800">
              {showComments ? "Hide" : "Show"}
            </button>
          </div>

          {showComments && (
            <>
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {post.comments?.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <p className="font-medium">{comment.user?.username || "Anonymous"}</p>
                      <p className="text-gray-600">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet</p>
                )}
              </div>

              {/* Add Comment */}
              {accessToken && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCommentSubmit}
                    disabled={isCommenting || !newComment.trim()}
                  >
                    {isCommenting ? "Posting..." : "Post"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Authentication Warning */}
        {!accessToken && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 text-center">
              Please log in to like, comment, save, and rate this recipe
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-6 pt-3 border-t">
          <button
            className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 ${
              isLikedByUser ? "text-red-600" : "text-gray-500 hover:text-red-600"
            } ${isLiking ? "opacity-50 cursor-not-allowed" : ""} ${!accessToken ? "opacity-50" : ""}`}
            onClick={handleLike}
            disabled={isLiking || !accessToken}
          >
            {isLiking ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            ) : isLikedByUser ? (
              <FaHeart className="text-3xl animate-pulse" />
            ) : (
              <CiHeart className="text-3xl" />
            )}
            {post.likes?.length || 0}
          </button>

          <button
            className="flex items-center gap-1 text-gray-500 text-sm font-medium hover:text-blue-600 transition-colors"
            onClick={toggleComments}
          >
            <IoChatboxOutline className="text-2xl" /> {post.comments?.length || 0}
          </button>

          <button
            className={`flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-yellow-600 transition-colors ${!accessToken ? "opacity-50" : ""}`}
            onClick={openRatingModal}
            disabled={!accessToken}
          >
            <MdReviews className="text-lg" />
            {post.average_rating && post.average_rating > 0 ? post.average_rating.toFixed(1) : "Rate"}
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

export default ViewPost
