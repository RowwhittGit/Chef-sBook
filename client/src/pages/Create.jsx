import React, { useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

function Create() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    ingredients: '',
    estimated_time: '',
    servings: '',
    difficulty: '',
    instructions: '',
    notes: '',
    image: null,
    video_url: '',
    category: '',
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files.length > 0) {
      // Always use the first file and ensure it's a File object
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        // Only append if value is a File object
        data.append('image', value);
      } else if (key !== 'image') {
        data.append(key, value || '');
      }
    });
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/posts/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Log the sent form data after posting
      for (let pair of data.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
      console.log('Response:', response.data);
      alert('Recipe submitted!');
    } catch (err) {
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      alert('Failed to submit recipe.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center px-2 py-8">
      <Header />
      <div className="w-full max-w-2xl mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center" style={{ boxShadow: '0 8px 32px rgba(255, 87, 34, 0.12)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create a New Recipe</h2>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Recipe Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter recipe title"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Short Description</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="A rich and creamy dessert made with milk, rice, cardamom, and nuts — perfect for festivals and celebrations."
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Ingredients</label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="List ingredients separated by commas"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Estimated Time</label>
                <input
                  type="text"
                  name="estimated_time"
                  value={formData.estimated_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. 00:45:00"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. 4"
                />
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Step-by-step instructions"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Notes <span className="text-gray-400 text-base">(Optional)</span></label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Any extra tips or notes?"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Recipe Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
              {preview && (
                <img src={preview} alt="Preview" className="mt-4 w-40 h-40 object-cover rounded-xl border-2 border-orange-200 shadow" />
              )}
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Video URL <span className='text-gray-400 text-base'>(Optional)</span></label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Paste YouTube or video link"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. Dessert, Main Course"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-semibold py-3 rounded-md transition duration-300 text-lg mt-2"
            >
              Post Recipe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create;
