import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const [formData, setFormData] = useState({
    message: '',
    url: '',
    notification_type: 'global'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const notificationTypes = [
    { value: 'global', label: '🌍 Global', description: 'Send to all users' },
    { value: 'followers', label: '👥 Followers', description: 'Send to your followers only' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (success || error) {
      setSuccess(false);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        message: formData.message.trim(),
        notification_type: formData.notification_type
      };

      // Only include URL if it's provided
      if (formData.url.trim()) {
        payload.url = formData.url.trim();
      }

      await axios.post('http://127.0.0.1:8000/api/notifications/push/', payload, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      setSuccess(true);
      setFormData({
        message: '',
        url: '',
        notification_type: 'global'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                <p className="text-gray-600 mt-1">Create and send notifications to users</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-white/50 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-500 text-xl mr-3">✅</div>
                  <div>
                    <h4 className="text-green-800 font-medium">Notification sent successfully!</h4>
                    <p className="text-green-600 text-sm mt-1">Your notification has been delivered to users.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-500 text-xl mr-3">⚠️</div>
                  <div>
                    <h4 className="text-red-800 font-medium">Error sending notification</h4>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Type Dropdown */}
            <div>
              <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                id="notification_type"
                name="notification_type"
                value={formData.notification_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter your notification message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/280 characters
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL (optional)
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/page"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional link that users can click in the notification
              </p>
            </div>

            {/* Preview Section */}
            {formData.message && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="You"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                        <span className="text-xs">
                          {formData.notification_type === 'global' ? '🌍' : '👥'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm mb-1">
                        <span className="font-semibold text-gray-900">You</span>
                        <span className="text-gray-600 ml-1">{formData.message}</span>
                      </div>
                      {formData.url && (
                        <a href="#" className="text-xs text-blue-500 hover:text-blue-700 hover:underline">
                          {formData.url}
                        </a>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Just now</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.message.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Send Notification
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ message: '', url: '', notification_type: 'global' })}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-500 text-xl mr-3 flex-shrink-0">💡</div>
            <div>
              <h4 className="text-blue-800 font-medium mb-1">Tips for effective notifications</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Keep messages concise and clear</li>
                <li>• Use global notifications for important announcements</li>
                <li>• Use follower notifications for personalized updates</li>
                <li>• Include relevant URLs when applicable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;