import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/posts/saved/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedPosts(res.data.results);
      } catch (err) {
        console.error('Failed to fetch saved posts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchSavedPosts();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading saved posts...
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10">
        You haven't saved any recipes yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {savedPosts.map((savedPost) => {
        const post = savedPost.post;
        return (
          <div
            key={savedPost.id}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <img
              src={post.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
              alt={post.title || 'Untitled'}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={post.user.profile_picture || 'https://via.placeholder.com/20x20'}
                  alt={post.user.username}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-xs text-gray-500">by {post.user.full_name || post.user.username}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {post.title || 'Untitled Recipe'}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {post.content || 'No description provided.'}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                Saved on {new Date(savedPost.saved_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SavedPosts;