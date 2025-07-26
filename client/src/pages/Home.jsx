import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import useCategoryStore from '../stores/categoryStore';
import Filters from '../components/Filters';
import { CiBookmark, CiHeart } from "react-icons/ci";
import { IoChatboxOutline } from "react-icons/io5";
import { RiShareForwardFill } from "react-icons/ri";
import { MdReviews } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function Home() {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const [recipes, setRecipes] = useState([]);
  const [commentStates, setCommentStates] = useState({});
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate()

  const handleRecipeClick = (id) => {
    // console.log(id)
    navigate(`/post/${id}`)
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/c/d1e0-067b-42b5-934f");
        const data = response.data;
        setRecipes(data);
        
        // Initialize comment states for each recipe
        const initialCommentStates = {};
        data.forEach(recipe => {
          initialCommentStates[recipe.id] = false;
        });
        setCommentStates(initialCommentStates);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    };

    getData();
  }, []);

  const toggleComment = (recipeId) => {
    setCommentStates(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  const handleCommentSubmit = (recipeId) => {
    if (!newComment.trim()) return;
    
    // In a real app, you would send this to your backend API
    // For now, we'll just simulate adding a comment
    const updatedRecipes = recipes.map(recipe => {
      if (recipe.id === recipeId) {
        const newCommentObj = {
          id: Math.max(...recipe.comments.map(c => c.id), 0) + 1,
          user: { id: 1, username: "CurrentUser" }, // Replace with actual user data
          post: recipeId,
          content: newComment,
          created_at: new Date().toISOString()
        };
        return {
          ...recipe,
          comments: [...recipe.comments, newCommentObj]
        };
      }
      return recipe;
    });
    
    setRecipes(updatedRecipes);
    setNewComment('');
  };

  return (
    <div className='bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-3 px-10 lg:px-20'>
      <Header />
      <Filters />
      <div className="max-w-full mx-auto mt-8 flex justify-center items-center">
        {recipes.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">No recipes found.</div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {recipes && recipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col sm:max-w-[400px] max-w-[300px] ${commentStates[recipe.id] ? 'h-[750px]' : 'h-[550px]'}`}
              >
                <div className="relative">
                  <img
                    src={'https://images.unsplash.com/photo-1504674900247-0877df9cc836'}
                    alt={recipe.title || 'Recipe'}
                    className="w-full h-56 object-cover cursor-pointer" onClick={() => handleRecipeClick(recipe.id)}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 shadow-lg rounded-full cursor-pointer group">
                      <CiBookmark className="text-2xl text-gray-700 group-hover:text-gray-900 transition" />
                      <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">
                        Add to Favourites
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                      alt="Chef"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white cursor-pointer shadow"
                    />
                    <span className="font-semibold text-gray-800 text-sm">Chef</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      {recipe.estimated_time?.replace('00:', '') || '30'} min • {recipe.servings || 1} servings
                    </span>
                    <button className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition shadow">
                      Following
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-red-700 mb-1 cursor-pointer">{recipe.title || 'Untitled Recipe'}</h3>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">{recipe.content || 'No description available.'}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {recipe.difficulty && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        {recipe.difficulty}
                      </span>
                    )}
                    {recipe.ingredients && (
                      <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                        Category
                      </span>
                    )}
                  </div>

                  {/* Comments Section */}
                  {commentStates[recipe.id] && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Comments ({recipe.comments?.length || 0})
                      </h4>
                      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                        {recipe.comments?.length > 0 ? (
                          recipe.comments.map((comment) => (
                            <div key={comment.id} className="text-sm">
                              <p className="font-medium">
                                {comment.user?.username || 'Anonymous'}
                              </p>
                              <p className="text-gray-600">{comment.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No comments yet</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                        <button 
                          className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm hover:bg-yellow-600 transition"
                          onClick={() => handleCommentSubmit(recipe.id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                        <CiHeart className="text-3xl" /> {recipe.likes?.length || 0}
                      </span>
                      <button 
                        className="flex items-center gap-1 text-gray-500 hover:text-yellow-600 text-sm font-medium"
                        onClick={() => toggleComment(recipe.id)}
                      >
                        <IoChatboxOutline className="text-2xl" /> {recipe.comments?.length || 0}
                      </button>
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-green-500">
                        <RiShareForwardFill className="text-2xl" /> 3
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MdReviews className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;