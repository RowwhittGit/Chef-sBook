import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    password2: '',
    address: '',
    dob: '',
    bio: '',
    profilePicture: null,
    profilePictureFile: null,
  });

  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profilePicture' && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
        profilePictureFile: file,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      alert('Passwords do not match.');
      return;
    }

    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('password2', formData.password2);
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('address', formData.address);

    if (formData.username) data.append('username', formData.username);
    if (formData.dob) data.append('dob', formData.dob);
    if (formData.profilePictureFile) {
      data.append('image', formData.profilePictureFile);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/users/register/", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Registration successful!');
      console.log(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('Registration failed! Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 font-pacifico mb-2">Chef'sBook</h1>
          <p className="text-gray-600 text-lg">Start your culinary journey</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Account</h2>
            <p className="text-gray-600 text-lg">Join and share your recipes!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div
                className="w-28 h-28 rounded-full border-4 border-orange-500 overflow-hidden cursor-pointer shadow-md"
                onClick={() => fileInputRef.current.click()}
              >
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
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
            <div className="flex space-x-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-1/2 px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-1/2 px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username (optional)"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth (optional)"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-orange-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <textarea
              name="bio"
              placeholder="Bio (optional)"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-semibold py-2 rounded-md transition duration-300"
            >
              Register
            </button>
            <button
              type="button"
              className="w-full mt-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-3 rounded-md shadow-md transition"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </form>
        </div>
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
}

export default Register2;
