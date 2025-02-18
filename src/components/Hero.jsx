import React from 'react';

const Hero = () => {
  return (
    <div name="home" className="h-screen w-full bg-gradient-to-b from-black via-black to-gray-800">
      <div className="max-w-screen-lg mx-auto flex flex-col items-center justify-center h-full px-4 md:flex-row">
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-4xl sm:text-6xl font-bold text-white text-center md:text-left">
            Thư Giãn & Làm Đẹp
          </h2>
          <p className="text-gray-500 py-4 max-w-md text-center md:text-left text-lg">
            Chào mừng bạn đến với Serenity Spa, nơi mang đến những trải nghiệm làm đẹp và thư giãn cao cấp. Hãy để chúng tôi chăm sóc và nuông chiều bạn.
          </p>
          <div className="flex justify-center md:justify-start">
            <button className="text-white w-full sm:w-auto px-8 py-4 my-2 flex items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer text-lg font-medium">
              Đặt Lịch Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;