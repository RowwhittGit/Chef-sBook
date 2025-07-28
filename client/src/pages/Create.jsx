"use client"

import { useState, useEffect } from "react"
import Header from "../components/Header"
import axios from "axios"
import useAuthStore from "../stores/authStore"
import CreatableSelect from "react-select/creatable"

function Create() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    ingredients: "",
    estimated_time: "",
    servings: "",
    difficulty: "",
    instructions: "",
    notes: "",
    image: null,
    video_url: "",
    category_id: "", // Changed from category to category_id
  })
  const [preview, setPreview] = useState(null)
  const token = useAuthStore((state) => state.accessToken)

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts/categories/", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json', // Changed from multipart/form-data
            },
          })
      const categoryOptions = response.data.map((category) => ({
        value: category.id, // Changed to use ID as value
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
        value: response.data.id, // Use ID as value
        label: response.data.name,
        id: response.data.id,
      }

      setCategories((prev) => [...prev, newCategory])
      setSelectedCategory(newCategory)
      setFormData((prev) => ({ ...prev, category_id: newCategory.value })) // Use category_id and ID value
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
      category_id: selectedOption ? selectedOption.value : "", // Use category_id and ID value
    }))
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "image" && files && files.length > 0) {
      const file = files[0]
      setFormData((prev) => ({ ...prev, image: file }))
      setPreview(URL.createObjectURL(file))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        data.append("image", value)
      } else if (key !== "image") {
        data.append(key, value || "")
      }
    })

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/posts/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      for (const pair of data.entries()) {
        console.log(pair[0] + ":", pair[1])
      }
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
        image: null,
        video_url: "",
        category_id: "", // Changed from category to category_id
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

  // Custom styles for CreatableSelect to match your form styling
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.125rem 0.5rem",
      fontSize: "1rem",
      minHeight: "2.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px #fb923c" : "none",
      borderColor: state.isFocused ? "#fb923c" : "#d1d5db",
      "&:hover": {
        borderColor: state.isFocused ? "#fb923c" : "#d1d5db",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center px-2 py-8">
      <Header />
      <div className="w-full max-w-2xl mt-8">
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center"
          style={{ boxShadow: "0 8px 32px rgba(255, 87, 34, 0.12)" }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create a New Recipe</h2>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Recipe Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter recipe title"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Short Description</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="A rich and creamy dessert made with milk, rice, cardamom, and nuts — perfect for festivals and celebrations."
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Ingredients</label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="List ingredients separated by commas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Estimated Time</label>
                <input
                  type="text"
                  name="estimated_time"
                  value={formData.estimated_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. 00:45:00"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Step-by-step instructions"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Notes <span className="text-gray-400 text-base">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Any extra tips or notes?"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Recipe Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
              {preview && (
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="mt-4 w-40 h-40 object-cover rounded-xl border-2 border-orange-200 shadow"
                />
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Video URL <span className="text-gray-400 text-base">(Optional)</span>
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Paste YouTube or video link"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Category</label>
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-semibold py-3 rounded-md transition duration-300 text-lg mt-2"
            >
              Post Recipe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Create