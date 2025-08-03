import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { FiUserMinus } from 'react-icons/fi';

function Following() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState(new Set());
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/following/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Following API response:', res.data);
        // The API returns an array of relationship objects, not user objects
        if (Array.isArray(res.data)) {
          setFollowing(res.data);
        } else {
          setFollowing([]);
        }
      } catch (err) {
        console.error('Failed to fetch following:', err);
        setFollowing([]);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchFollowing();
    }
  }, [accessToken]);

  const handleUnfollow = async (followingId, followingUsername) => {
    setUnfollowingIds(prev => new Set(prev).add(followingId));
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/unfollow/${followingId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Remove the relationship from the following list
      setFollowing(prev => prev.filter(relationship => relationship.following !== followingId));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(followingId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading following...
      </div>
    );
  }

  if (!following || following.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10">
        You are not following anyone yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {following.map((relationship) => (
        <div
          key={relationship.id}
          className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition"
        >
          <img
            src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg"
            alt={relationship.following_username}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/profile/${relationship.following_username}`)}
          />
          
          <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${relationship.following_username}`)}>
            <h3 className="font-semibold text-gray-900">
              {relationship.following_username}
            </h3>
            <p className="text-sm text-gray-500">@{relationship.following_username}</p>
          </div>
          
          <button
            onClick={() => handleUnfollow(relationship.following, relationship.following_username)}
            disabled={unfollowingIds.has(relationship.following)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
              unfollowingIds.has(relationship.following)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <FiUserMinus size={16} />
            {unfollowingIds.has(relationship.following) ? 'Unfollowing...' : 'Unfollow'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Following;