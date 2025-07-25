import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import useCategoryStore from '../stores/categoryStore';
import Filters from '../components/Filters';
import { CiBookmark, CiHeart } from "react-icons/ci";
import { IoChatboxOutline } from "react-icons/io5";
import { RiShareForwardFill } from "react-icons/ri";
import { MdReviews } from "react-icons/md";

function Home() {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/c/28fd-8e29-45b2-ac1a");
        const data = response.data;
        setRecipes(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    };

    getData();
  }, []);

  return (
    <div className='bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-3 px-10 lg:px-20'>
      <Header />
      <Filters />
      <div className="max-w-full mx-auto mt-8 flex justify-center items-center">
        {recipes.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">No recipes found.</div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center ">
            {recipes && recipes.map((recipe, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:max-w-[400px] max-w-[300px] " >
                <div className="relative">
                  <img
                    src={'https://images.unsplash.com/photo-1504674900247-0877df9cc836'}
                    alt={recipe.title || 'Recipe'}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-14 h-13 flex items-center justify-center bg-white hover:bg-gray-100 shadow-2xl rounded-full relative cursor-pointer group" onClick={() => navigate("/chat")} >
                      <CiBookmark className="w-8 h-8" style={{ fontSize: '3rem' }} />
                      <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">Add to Favourites</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={'https://images.unsplash.com/photo-1504674900247-0877df9cc836'}
                      alt={recipe.title || 'Chef'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                    />
                    <span className="font-semibold text-gray-800">Chef</span>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      {recipe.estimated_time?.replace('00:', '') || '30'} min • {recipe.servings || 1} servings
                    </span>
                    <button className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold shadow">Following</button>
                  </div>
                  <h3 className="text-xl font-bold text-red-700 mb-1">{recipe.title || 'Untitled Recipe'}</h3>
                  <p className="text-gray-600 mb-2 text-sm">{recipe.content || 'No description available.'}</p>
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
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-6">
                      <span className="flex items-center gap-1 text-red-600 font-bold">
                        <CiHeart /> 127
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 font-semibold">
                        <IoChatboxOutline />1295
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 font-semibold">
                        <RiShareForwardFill /> 3
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MdReviews />
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
