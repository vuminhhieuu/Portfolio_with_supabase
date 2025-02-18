import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../lib/auth';
import Login from './Login';
import Dashboard from './Dashboard';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login onLogin={checkUser} />;
};

export default AdminLayout