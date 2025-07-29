import React, { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import useAuthStore from '../stores/authStore'
import axios from 'axios'

function ProfileEdit() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [userId, setUserId] = useState(null)
  const [form, setForm] = useState({
    username: '',
    email: '',
    full_name: '',
    profile_picture: '',
    profilePictureFile: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef()

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', 'rohit_test')
    data.append('cloud_name', 'dpcux5ovk')

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dpcux5ovk/image/upload', {
        method: 'POST',
        body: data,
      })
      const json = await res.json()
      return json.secure_url
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      throw err
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setUserId(res.data.id)
        setForm({
          username: res.data.username || '',
          email: res.data.email || '',
          full_name: res.data.full_name || '',
          profile_picture: res.data.profile_picture || '',
          profilePictureFile: null,
        })
      } catch (err) {
        setError('Failed to load profile.')
      }
    }
    fetchProfile()
  }, [accessToken])

  const handleChange = async (e) => {
    const { name, value, files } = e.target
    if (name === 'profilePicture' && files.length > 0) {
      const file = files[0]
      try {
        const uploadedUrl = await uploadToCloudinary(file)
        setForm((prev) => ({
          ...prev,
          profile_picture: uploadedUrl,
          profilePictureFile: file,
        }))
      } catch (error) {
        setError('Failed to upload image.')
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!userId) {
      setError('User ID not found.')
      setLoading(false)
      return
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/auth/users/${userId}/update/`,
        {
          email: form.email,
          full_name: form.full_name,
          profile_picture: form.profile_picture,
          is_premium: false,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      setSuccess('Profile updated successfully!')
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        )
      } else {
        setError('Failed to update profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Edit Profile</h2>
              <p className="text-gray-600 text-lg">Update your details below</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div
                  className="w-28 h-28 rounded-full border-4 border-orange-500 overflow-hidden cursor-pointer shadow-md"
                  onClick={() => fileInputRef.current.click()}
                >
                  {form.profile_picture ? (
                    <img
                      src={form.profile_picture}
                      alt="Profile Preview"
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-orange-100 text-orange-500 text-5xl font-bold select-none">
                      +
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleChange}
                />
              </div>

              {/* Username - disabled field */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  disabled
                  className="w-full px-4 py-3 border border-orange-200 bg-gray-100 text-gray-600 rounded-md cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">Username cannot be changed.</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-semibold py-2 rounded-md transition duration-300"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>

              {error && <div className="text-red-600 text-center mt-2">{error}</div>}
              {success && <div className="text-green-600 text-center mt-2">{success}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileEdit
 