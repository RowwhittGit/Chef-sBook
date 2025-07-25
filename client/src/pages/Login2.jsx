import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useProfileStore from '../stores/ProfileStore';

function Login2() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const fetchProfile = useProfileStore((state) => state.fetchProfile); // ✅ Get fetchProfile

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = res.data;

      // ✅ Store tokens
      setTokens({ access, refresh });

      // ✅ Fetch the profile
      await fetchProfile();

      alert('Login successful!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff1eb] px-4">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[#f44336]">Chef's</span>
        <span className="text-[#f44336]">Book</span>
      </h1>
      <p className="text-gray-600 mb-8">Welcome back to your culinary journey</p>

      <div className="bg-white rounded-xl max-w-md w-full p-8 ">
        <h2 className="text-xl font-semibold text-center mb-2">Sign In</h2>
        <p className="text-sm text-gray-600 text-center mb-6">Continue your cooking adventure</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <span className="border-t w-full border-gray-300"></span>
          <span className="border-t w-full border-gray-300"></span>
        </div>

        <button className="w-full border border-gray-300 py-2 rounded-md text-sm hover:bg-gray-50 transition">
          Continue with Google
        </button>

        <p className="text-sm text-center mt-6">
          Don’t have an account? <span className="text-orange-500 font-medium cursor-pointer" onClick={() => navigate("/register")}>Sign up</span>
        </p>
        <p className="text-xs text-center text-gray-500 mt-2 cursor-pointer hover:underline">Forgot your password?</p>
      </div>
    </div>
  );
}

export default Login2;
