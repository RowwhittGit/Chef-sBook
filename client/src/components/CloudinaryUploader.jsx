"use client"

import { useState } from "react"

export default function CloudinaryUploader({ onUploadComplete, currentImage }) {
  const [isUploading, setIsUploading] = useState(false)

  const uploadToCloudinary = async (file) => {
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "your_upload_preset") // Make sure this is an UNSIGNED preset

    try {
      // Make sure to replace 'your_cloud_name' with your actual cloud name
      const response = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Cloudinary error:", data)
        throw new Error(data.error?.message || "Upload failed")
      }

      onUploadComplete(data.secure_url)
    } catch (error) {
      console.error("Upload error:", error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      uploadToCloudinary(file)
    }
  }

  const handleRemoveImage = () => {
    onUploadComplete(null)
  }

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative inline-block">
          <img
            src={currentImage || "/placeholder.svg"}
            alt="Uploaded preview"
            className="mt-4 w-40 h-40 object-cover rounded-xl border-2 border-orange-200 shadow"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> recipe image
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
            </div>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}

      {isUploading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-orange-500 bg-orange-100">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading image...
          </div>
        </div>
      )}
    </div>
  )
}
