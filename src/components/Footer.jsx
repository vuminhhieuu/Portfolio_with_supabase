import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Hương Anh Spa</h3>
            <p className="text-gray-400">Địa chỉ: 1181 Lý Nhân Tông, Duy Tiên, Hà Nam</p>
            <p className="text-gray-400">Hotline: 0123.456.789</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Giờ Mở Cửa</h3>
            <p className="text-gray-400">Thứ 2 - Thứ 6: 7:00 - 21:00</p>
            <p className="text-gray-400">Thứ 7 - Chủ Nhật: 8:00 - 21:30</p>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-4">Kết Nối</h3>
            <div className="flex justify-center md:justify-end space-x-6">
              <FaFacebook className="text-3xl cursor-pointer hover:text-blue-500" />
              <FaInstagram className="text-3xl cursor-pointer hover:text-pink-500" />
              <FaTiktok className="text-3xl cursor-pointer hover:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400">&copy; 2024 HuongAnh Spa. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;