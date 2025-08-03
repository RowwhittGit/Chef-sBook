import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { FiUserMinus } from 'react-icons/fi';

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState(new Set());
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/followers/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Followers API response:', res.data);
        // The API returns an array of relationship objects, not user objects
        if (Array.isArray(res.data)) {
          setFollowers(res.data);
        } else {
          setFollowers([]);
        }
      } catch (err) {
        console.error('Failed to fetch followers:', err);
        setFollowers([]);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchFollowers();
    }
  }, [accessToken]);

  const handleUnfollow = async (followerId, followerUsername) => {
    setUnfollowingIds(prev => new Set(prev).add(followerId));
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/unfollow/${followerId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Remove the relationship from the followers list
      setFollowers(prev => prev.filter(relationship => relationship.follower !== followerId));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(followerId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading followers...
      </div>
    );
  }

  if (!followers || followers.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10">
        You don't have any followers yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {followers.map((relationship) => (
        <div
          key={relationship.id}
          className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition"
        >
          <img
            src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg"
            alt={relationship.follower_username}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/profile/${relationship.follower_username}`)}
          />
          
          <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${relationship.follower_username}`)}>
            <h3 className="font-semibold text-gray-900">
              {relationship.follower_username}
            </h3>
            <p className="text-sm text-gray-500">@{relationship.follower_username}</p>
          </div>
          
          <button
            onClick={() => handleUnfollow(relationship.follower, relationship.follower_username)}
            disabled={unfollowingIds.has(relationship.follower)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
              unfollowingIds.has(relationship.follower)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <FiUserMinus size={16} />
            {unfollowingIds.has(relationship.follower) ? 'Unfollowing...' : 'Unfollow'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Followers;