import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Filters from '../components/Filters';
import { CiHeart } from "react-icons/ci";
import { IoChatboxOutline } from "react-icons/io5";
import { MdReviews } from "react-icons/md";
import useAuthStore from '../stores/authStore';

function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = useAuthStore((state) => state.accessToken)
  console.log(accessToken)

  useEffect(() => {
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/posts/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        setPost(res.data);
        console.log(id)
        console.log(res.data)
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch post.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-12 text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-12 text-lg">{error}</div>;
  if (!post) return null;

  return (
    <div className='bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-3 px-10 lg:px-20 min-h-screen'>
      <Header />
      <Filters />
      <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src={post.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'}
            alt={post.title || 'Recipe'}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
          <h1 className="text-2xl font-bold text-red-700 mb-2">{post.title || 'Untitled Recipe'}</h1>
          <span className="text-gray-500 text-sm mb-2">By {post.user?.username || 'Chef'} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Description</h2>
          <p className="text-gray-700 text-base">{post.content || 'No description available.'}</p>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Ingredients</h2>
          <p className="text-gray-700 text-base">{post.ingredients || 'No ingredients listed.'}</p>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Instructions</h2>
          <p className="text-gray-700 text-base">{post.instructions || 'No instructions provided.'}</p>
        </div>
        <div className="mb-4 flex gap-4">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">{post.difficulty || 'Difficulty: N/A'}</span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">Servings: {post.servings || 'N/A'}</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Time: {post.estimated_time || 'N/A'}</span>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Notes</h2>
          <p className="text-gray-700 text-base">{post.notes || 'No notes.'}</p>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Comments ({post.comments?.length || 0})</h2>
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
            {post.comments?.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <p className="font-medium">{comment.user?.username || 'Anonymous'}</p>
                  <p className="text-gray-600">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 pt-3 border-t">
          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
            <CiHeart className="text-3xl" /> {post.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
            <IoChatboxOutline className="text-2xl" /> {post.comments?.length || 0}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
            <MdReviews className="text-lg" /> {post.average_rating || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ViewPost;
