import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

function MyRecipes({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/posts/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchPosts();
    }
  }, [accessToken]);

  const myPosts = posts.filter((post) => post.user?.id === user?.id);

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading recipes...
      </div>
    );
  }

  if (myPosts.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10">
        You haven't posted any recipes yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {myPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <img
            src={post.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
            alt={post.title || 'Untitled'}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800">
              {post.title || 'Untitled Recipe'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {post.content || 'No description provided.'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyRecipes;