import React, { useState } from 'react';
import Header from '../components/Header';

function Create() {
  const [formData, setFormData] = useState({
    title: '',
    maincontent: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to post recipe
    alert('Recipe submitted!');
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
              <label className="block text-lg font-semibold mb-2 text-gray-700">Main Content</label>
              <textarea
                name="maincontent"
                value={formData.maincontent}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Describe your recipe..."
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
