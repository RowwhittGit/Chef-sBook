import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import MyRecipes from '../components/MyRecipes'; // Add this import
import SavedPosts from '../components/SavedPosts';
import Followers from '../components/Followers';
import Following from '../components/Following';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useProfileStore from '../stores/ProfileStore';

function Profile() {
  const [user, setUser] = useState(null);
  const [savedPostsCount, setSavedPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recipes');
  const [showSettings, setShowSettings] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logoutAuth = useAuthStore((state) => state.clearTokens);
  const clearProfile = useProfileStore((state) => state.clearProfile);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
          headers: { Authorization: `Bearer ${accessToken}` },
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

  useEffect(() => {
    const fetchSavedPostsCount = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/posts/saved/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedPostsCount(res.data.count);
      } catch (err) {
        console.error('Failed to fetch saved posts count:', err);
      }
    };
    if (accessToken) fetchSavedPostsCount();
  }, [accessToken]);

  const profileImg = user?.profile_picture || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836';
  const username = user?.username || 'username';
  const email = user?.email || 'email@example.com';
  const fullName = user?.full_name || username;
  const isPremium = user?.is_premium;
  const followers = user?.follower_count ?? 0;
  const following = user?.following_count ?? 0;
  const totalRecipes = 0; // This will be handled by MyRecipes component

  const tabButtonClasses = (name) =>
    name === activeTab
      ? 'bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow flex items-center gap-2'
      : 'text-gray-600 font-semibold px-2 py-2 rounded-md flex items-center gap-2';

  if (loading) return <div className="text-center text-green-900">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  const handleLogout = () => {
    logoutAuth();
    clearProfile();
    navigate('/login');
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center px-2 py-8">
        <div className="w-full max-w-3xl mt-8">

          {/* Profile Info */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 pb-4 relative flex flex-col items-center">
            <div className="flex items-center gap-6 w-full">
              <div className="relative">
                <img src={profileImg} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                <h1 className='text-gray-600 font-semibold mt-1'>@{username}</h1>
                {isPremium && (
                  <span className="absolute bottom-2 right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-2 py-1 shadow">Premium</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h2>
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
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md shadow transition" onClick={() => navigate('/edit_profile')}>Edit Profile</button>
                  <button className="border border-red-600 text-red-600 font-semibold px-5 py-2 rounded-md shadow transition hover:bg-red-50" onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: `${username}'s Chef-sBook Profile`, url: window.location.href });
                    } else {
                      window.prompt('Copy and share this link:', window.location.href);
                    }
                  }}>Share Profile</button>
                  <button className="border border-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-md shadow transition hover:bg-gray-50" onClick={() => setShowSettings(true)}>Settings</button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 bg-white rounded-xl shadow-2xl flex items-center px-4 py-2 gap-4">
            <button onClick={() => setActiveTab('recipes')} className={tabButtonClasses('recipes')}>
              My Recipes <span className="ml-2 bg-white text-red-600 rounded-full px-2 text-xs font-bold">{totalRecipes}</span>
            </button>
            <button onClick={() => setActiveTab('saved')} className={tabButtonClasses('saved')}>
              Saved <span className="ml-1 text-gray-400">{savedPostsCount}</span>
            </button>
            <button onClick={() => setActiveTab('following')} className={tabButtonClasses('following')}>
              Following <span className="ml-1 text-gray-400">{following}</span>
            </button>
            <button onClick={() => setActiveTab('followers')} className={tabButtonClasses('followers')}>
              Followers <span className="ml-1 text-gray-400">{followers}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'recipes' && (
              <MyRecipes user={user} />
            )}

            {activeTab === 'saved' && (
              <SavedPosts />
            )}

            {activeTab === 'following' && (
              <Following />
            )}

            {activeTab === 'followers' && (
              <Followers />
            )}
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Settings</h3>
                <div className="space-y-3">
                  <button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <button 
                    className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;