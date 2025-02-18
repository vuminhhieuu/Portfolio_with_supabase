import React, { useState } from 'react';
import { signOut } from '../../lib/auth';
import { toast } from 'react-hot-toast';
import BookingManagement from './BookingManagement';
import ContentManagement from './ContentManagement';
import GalleryManagement from './GalleryManagement';
import AboutManagement from './AboutManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = '/admin';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <BookingManagement />;
      case 'services':
        return <ContentManagement />;
      case 'gallery':
        return <GalleryManagement />;
      case 'about':
        return <AboutManagement />;
      default:
        return <BookingManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 text-white">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quản Trị Website</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition duration-200"
          >
            Đăng Xuất
          </button>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex gap-4 flex-wrap">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                Đặt Lịch
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'services'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('services')}
              >
                Dịch Vụ
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'gallery'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('gallery')}
              >
                Hình Ảnh
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'about'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('about')}
              >
                Giới Thiệu
              </button>
            </nav>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;