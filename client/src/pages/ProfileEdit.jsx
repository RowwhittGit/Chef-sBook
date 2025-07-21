import React, { useEffect, useState, useRef } from 'react';
import useProfileStore from '../stores/profileStore';
import useAuthStore from '../stores/authStore';

function ProfileEdit() {
  const { user, loading, error, fetchProfile, updateProfile } = useProfileStore();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef();

  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        address: user.address || '',
        dob: user.dob || '',
        image: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setEditMode(false);
  };

  if (loading) return <div className="text-center text-green-900">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-400 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-green-900 mb-6 text-center">Your Profile</h2>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-28 h-28 rounded-full border-4 border-green-500 overflow-hidden shadow-md">
            {user?.image ? (
              <img src={user.image} alt="Profile" className="object-cover w-full h-full rounded-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-green-100 text-green-500 text-5xl font-bold select-none">
                {user?.first_name?.[0] || user?.email?.[0]}
              </div>
            )}
          </div>

          {!editMode ? (
            <div className="w-full space-y-2">
              <p><strong>First Name:</strong> {user?.first_name}</p>
              <p><strong>Last Name:</strong> {user?.last_name}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Address:</strong> {user?.address}</p>
              <p><strong>Date of Birth:</strong> {user?.dob}</p>
              <button
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="w-full px-4 py-2 border border-green-300 rounded-md" required />
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="w-full px-4 py-2 border border-green-300 rounded-md" required />
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full px-4 py-2 border border-green-300 rounded-md" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 border border-green-300 rounded-md" required />
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full px-4 py-2 border border-green-300 rounded-md" required />
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-green-300 rounded-md text-gray-500" />
              <input type="file" name="image" accept="image/*" className="w-full px-4 py-2 border border-green-300 rounded-md" ref={fileInputRef} onChange={handleChange} />
              <div className="flex space-x-2">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md">Save</button>
                <button type="button" className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 rounded-md shadow-md" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;
