import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchUser();
  }, [accessToken]);

  // Dummy/fallbacks for demonstration
  const profileImg = user?.profile_picture || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836';
  const username = user?.username || 'username';
  const email = user?.email || 'email@example.com';
  const fullName = user?.full_name || username;
  const isPremium = user?.is_premium;
  const followers = user?.follower_count ?? 0;
  const following = user?.following_count ?? 0;
  const totalRecipes = user?.total_recipes ?? 24;
  // Demo recipes (remove if you have real data)
  const recipes = [
    { id: 1, title: 'Spicy Szechuan Noodles', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', status: 'published', difficulty: 'Medium' },
    { id: 2, title: 'Homemade Dumplings', img: 'https://images.unsplash.com/photo-1519864600265-abb224a0e99c', status: 'published', difficulty: 'Hard' },
    { id: 3, title: 'Asian Fusion Salad', img: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0', status: 'draft', difficulty: 'Easy' },
  ];

  if (loading) return <div className="text-center text-green-900">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div>

      <Header />
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center px-2 py-8">
      <div className="w-full max-w-3xl mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 pb-4 relative flex flex-col items-center" style={{ boxShadow: '0 8px 32px rgba(255, 87, 34, 0.12)' }}>
          <div className="flex items-center gap-6 w-full">
            <div className="relative">
              <img
                src={profileImg}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isPremium && (
                <span className="absolute bottom-2 right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-2 py-1 shadow">Premium</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{username}</h2>
              <div className="text-lg text-gray-600 mb-1">{email}</div>
              <div className="flex gap-8 mt-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{totalRecipes}</div>
                  <div className="text-xs text-gray-500">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{followers}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{following}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
                {/* Removed Total Likes */}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md shadow transition">Edit Profile</button>
                <button className="border border-red-600 text-red-600 font-semibold px-5 py-2 rounded-md shadow transition hover:bg-red-50">Share Profile</button>
                <button className="border border-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-md shadow transition hover:bg-gray-50">Settings</button>
              </div>
            </div>
          </div>
          {/* Removed tags section as tags is not defined in user data */}
        </div>
        <div className="mt-6 bg-white rounded-xl shadow flex items-center px-4 py-2 gap-4">
          <button className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow mr-2 flex items-center gap-2">
             My Recipes <span className="ml-2 bg-white text-red-600 rounded-full px-2 text-xs font-bold">{totalRecipes}</span>
          </button>
          <button className="text-gray-600 font-semibold px-2 py-2 rounded-md">Saved <span className="ml-1 text-gray-400">12</span></button>
          <button className="text-gray-600 font-semibold px-2 py-2 rounded-md">Following <span className="ml-1 text-gray-400">{following}</span></button>
          <button className="text-gray-600 font-semibold px-2 py-2 rounded-md">Followers <span className="ml-1 text-gray-400">{followers}</span></button>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="bg-red-100 text-red-600 font-semibold px-4 py-1 rounded-full">All ({recipes.length})</button>
          <button className="bg-gray-100 text-gray-600 font-semibold px-4 py-1 rounded-full">Published (2)</button>
          <button className="bg-gray-100 text-gray-600 font-semibold px-4 py-1 rounded-full">Drafts (1)</button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden relative">
              <img src={recipe.img} alt={recipe.title} className="w-full h-40 object-cover" />
              <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold shadow">{recipe.difficulty}</div>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow"
                style={{ backgroundColor: recipe.status === 'published' ? '#e0f7fa' : '#ffe0e0', color: recipe.status === 'published' ? '#009688' : '#e57373' }}>
                {recipe.status}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{recipe.title}</h3>
                <button className="mt-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">View Recipe</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Profile;
