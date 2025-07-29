import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';

function MyRecipes({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());
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

  const handleEditPost = (postId) => {
    navigate(`/post/update/${postId}`);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(postId));
    try {
      await axios.delete(`http://127.0.0.1:8000/api/posts/${postId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Remove the post from the list
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete the recipe. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

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
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition relative group"
        >
          {/* Action Buttons */}
          <div className="absolute top-4 right-4  transition-opacity flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditPost(post.id);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-full shadow-lg transition w-[50px] h-[50px] flex items-center justify-center"
              title="Edit Recipe"
            >
              <FiEdit3 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePost(post.id);
              }}
              disabled={deletingIds.has(post.id)}
              className={`p-2 rounded-full shadow-lg transition ${
                deletingIds.has(post.id)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : ' w-[50px] h-[50px] flex items-center justify-center hover:bg-red-700 text-white bg-red-600'
              }`}
              title={deletingIds.has(post.id) ? 'Deleting...' : 'Delete Recipe'}
            >
              <FiTrash2 size={16} />
            </button>
          </div>

          <div 
            className="cursor-pointer"
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
        </div>
      ))}
    </div>
  );
}

export default MyRecipes;