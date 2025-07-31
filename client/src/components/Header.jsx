import React, { useState } from 'react';
import { PiMessengerLogoBold } from "react-icons/pi";
import { IoNotificationsOutline } from "react-icons/io5";
import useProfileStore from '../stores/ProfileStore';
import { MdOutlineAddToPhotos } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

function Header() {
  const navigate = useNavigate()
  const { user } = useProfileStore();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Fallbacks for demo
  const profileImg = user?.profile_picture
  const username = user?.username || "rowwhitt_don";
  const fullName = user?.full_name;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-3 px-10 lg:px-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-gray-100 cursor-pointer" onClick={() => navigate("/profile")} >
            <img
              className="w-full h-full object-cover rounded-full"
              src={profileImg}
              alt="Profile"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-bold text-lg sm:text-xl text-gray-900 leading-tight">{username}</span>
            <span className="text-gray-500 text-sm sm:text-base -mt-1">{fullName}</span>
          </div>
        </div>

        <div className="text-center mt-2 flex-1">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 font-pacifico mb-2">Chef'sBook</h1>
          <p className="text-gray-600 text-lg">Start your culinary journey</p>
        </div>

        <div className='flex gap-4 sm:gap-6 items-center mt-2'>
          {/* Plus Icon with Tooltip */}
          <div className="w-16 h-16 flex items-center justify-center bg-white hover:bg-gray-100 shadow-2xl rounded-full relative cursor-pointer group" onClick={() => navigate("/create")} >
            <MdOutlineAddToPhotos className="w-10 h-10" style={{ fontSize: '3rem' }} />
            <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">Create</div>
          </div>

          {/* Notification Icon with Tooltip */}
          <div className="relative">
            <div className="w-16 h-16 flex items-center justify-center bg-white hover:bg-gray-100 shadow-2xl rounded-full relative cursor-pointer group" onClick={toggleNotifications} >
              <IoNotificationsOutline className="w-10 h-10" style={{ fontSize: '3rem' }} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1 shadow-lg border-2 border-white flex items-center justify-center" style={{ minWidth: '2rem', height: '2rem', textAlign: 'center' }}>3</span>
              <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">Notifications</div>
            </div>
            {showNotifications && <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
          </div>

          {/* Messenger Icon with Tooltip */}
          <div className="w-16 h-16 flex items-center justify-center bg-white hover:bg-gray-100 shadow-2xl rounded-full relative cursor-pointer group" onClick={() => navigate("/chat")} >
            <PiMessengerLogoBold className="w-10 h-10" style={{ fontSize: '3rem' }} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1 shadow-lg border-2 border-white flex items-center justify-center" style={{ minWidth: '2rem', height: '2rem', textAlign: 'center' }}>6</span>
            <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200 z-20">Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;