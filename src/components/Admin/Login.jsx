import React, { useState } from 'react';
import { signIn } from '../../lib/auth';
import { toast } from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } else {
      toast.success('Đăng nhập thành công!');
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Đăng Nhập Quản Trị</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-white block mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-md hover:opacity-90 transition duration-200"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login