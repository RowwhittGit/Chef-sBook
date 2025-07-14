import React, { useState, useRef } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    username: '',
    profilePicture: null,         // for preview
    profilePictureFile: null,     // actual file
  });

  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profilePicture' && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),   // preview
        profilePictureFile: file,                    // actual file
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

    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('username', formData.username);
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);

    if (formData.profilePictureFile) {
      data.append('profile_picture', formData.profilePictureFile);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/register/", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Registration successful!');
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert('Registration failed!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-400 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-green-900 mb-6 text-center">Create an Account</h2>

        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-6">
          <div
            className="w-28 h-28 rounded-full border-4 border-green-500 overflow-hidden cursor-pointer shadow-md"
            onClick={() => fileInputRef.current.click()}
          >
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-green-100 text-green-500 text-5xl font-bold select-none">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex space-x-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md shadow-md transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
