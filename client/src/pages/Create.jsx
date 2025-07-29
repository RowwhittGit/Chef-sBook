"use client"
import { useState, useEffect } from "react"
import {
  AiOutlineClockCircle,
  AiOutlineUser,
  AiOutlineFileText,
  AiOutlineCamera,
  AiOutlineVideoCamera,
  AiOutlineTag,
  AiOutlineUpload,
  AiOutlineCheck,
} from "react-icons/ai"
import { GiChefToque } from "react-icons/gi"

// Your actual imports - replace these mocks with your real imports
import Header from "../components/Header"
import axios from "axios"
import useAuthStore from "../stores/authStore"
import CreatableSelect from "react-select/creatable"

function Create() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    ingredients: "",
    estimated_time: "",
    servings: "",
    difficulty: "",
    instructions: "",
    notes: "",
    image_url: null,
    video_url: "",
    category_id: "",
  })
  const [preview, setPreview] = useState(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const uploadToCloudinary = async (file) => {
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "rohit_test")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dpcux5ovk/image/upload", {
        method: "POST",
        body: data,
      })
      const json = await res.json()
      console.log("Cloudinary response:", json)
      setFormData((prev) => ({ ...prev, image_url: json.secure_url }))
      return json.secure_url
    } catch (err) {
      console.error("Cloudinary upload error:", err)
      throw err
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts/categories/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const categoryOptions = response.data.map((category) => ({
        value: category.id,
        label: category.name,
        id: category.id,
      }))
      setCategories(categoryOptions)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleCreateCategory = async (inputValue) => {
    setIsLoadingCategories(true)
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts/categories/",
        { name: inputValue },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      const newCategory = {
        value: response.data.id,
        label: response.data.name,
        id: response.data.id,
      }
      setCategories((prev) => [...prev, newCategory])
      setSelectedCategory(newCategory)
      setFormData((prev) => ({ ...prev, category_id: newCategory.value }))
    } catch (error) {
      console.error("Error creating category:", error)
      alert("Failed to create category.")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption)
    setFormData((prev) => ({
      ...prev,
      category_id: selectedOption ? selectedOption.value : "",
    }))
  }

  const handleChange = async (e) => {
    const { name, value, files } = e.target
    if (name === "image_url" && files && files.length > 0) {
      const file = files[0]
      setIsUploading(true)
      try {
        const uploadedUrl = await uploadToCloudinary(file)
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }))
        setPreview(URL.createObjectURL(file))
      } catch (err) {
        alert("Image upload failed. Please try again.")
        console.error(err)
      } finally {
        setIsUploading(false)
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    if (isUploading) {
      alert("Please wait for the image to finish uploading before submitting.")
      return
    }
    if (!formData.image_url) {
      alert("Please upload an image before submitting.")
      return
    }
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/posts/", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      console.log("Response:", response.data)
      alert("Recipe submitted!")
      // Reset form
      setFormData({
        title: "",
        content: "",
        ingredients: "",
        estimated_time: "",
        servings: "",
        difficulty: "",
        instructions: "",
        notes: "",
        image_url: null,
        video_url: "",
        category_id: "",
      })
      setSelectedCategory(null)
      setPreview(null)
    } catch (err) {
      if (err.response) {
        console.error("Error response:", err.response.data)
      }
      alert("Failed to submit recipe.")
      console.error(err)
    }
  }

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "2px solid #e5e7eb",
      borderRadius: "0.5rem",
      padding: "0.25rem 0.75rem",
      fontSize: "1rem",
      minHeight: "3rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(251, 146, 60, 0.1)" : "none",
      borderColor: state.isFocused ? "#fb923c" : "#e5e7eb",
      "&:hover": {
        borderColor: state.isFocused ? "#fb923c" : "#9ca3af",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#fb923c" : state.isFocused ? "#fed7aa" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#fb923c" : "#fed7aa",
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <GiChefToque className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Create New Recipe</h1>
            <p className="text-orange-100 text-lg">Share your culinary masterpiece with the world</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Recipe Title */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineFileText className="w-5 h-5 mr-2 text-orange-500" />
                  Recipe Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Enter your amazing recipe title..."
                />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineFileText className="w-5 h-5 mr-2 text-orange-500" />
                  Short Description
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="A brief, appetizing description of your recipe..."
                />
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineFileText className="w-5 h-5 mr-2 text-orange-500" />
                  Ingredients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="List all ingredients (e.g., 2 cups flour, 1 tsp salt, 3 eggs...)"
                />
              </div>

              {/* Time, Servings, and Difficulty Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <AiOutlineClockCircle className="w-5 h-5 mr-2 text-orange-500" />
                    Prep Time
                  </label>
                  <input
                    type="text"
                    name="estimated_time"
                    value={formData.estimated_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                    placeholder="00:45:00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <AiOutlineUser className="w-5 h-5 mr-2 text-orange-500" />
                    Servings
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    required
                    min={1}
                    className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                    placeholder="4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <GiChefToque className="w-5 h-5 mr-2 text-orange-500" />
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">Select level</option>
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineFileText className="w-5 h-5 mr-2 text-orange-500" />
                  Cooking Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Step-by-step cooking instructions..."
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineFileText className="w-5 h-5 mr-2 text-orange-500" />
                  Chef's Notes
                  <span className="text-gray-400 text-base ml-2 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Any special tips, variations, or personal notes..."
                />
              </div>

              {/* Recipe Image */}
              <div className="space-y-4">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineCamera className="w-5 h-5 mr-2 text-orange-500" />
                  Recipe Photo
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors duration-200">
                  <input
                    type="file"
                    name="image_url"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        <span className="text-orange-500 font-semibold">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <AiOutlineUpload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-600 font-medium">Click to upload recipe photo</span>
                        <span className="text-gray-400 text-sm">PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </label>
                </div>

                {preview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Recipe preview"
                        className="w-64 h-64 object-cover rounded-xl border-4 border-orange-200 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <AiOutlineCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineVideoCamera className="w-5 h-5 mr-2 text-orange-500" />
                  Video Tutorial
                  <span className="text-gray-400 text-base ml-2 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <AiOutlineTag className="w-5 h-5 mr-2 text-orange-500" />
                  Category
                </label>
                <CreatableSelect
                  isClearable
                  isLoading={isLoadingCategories}
                  options={categories}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  onCreateOption={handleCreateCategory}
                  placeholder="Select or create a category..."
                  styles={customSelectStyles}
                  formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  noOptionsMessage={() => "No categories found"}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    isUploading ? "opacity-50 cursor-not-allowed transform-none" : ""
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading Image...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <GiChefToque className="w-5 h-5" />
                      <span>Publish Recipe</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Create
