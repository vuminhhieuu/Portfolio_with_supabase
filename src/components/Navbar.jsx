import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [nav, setNav] = useState(false);

  const links = [
    { id: 1, link: 'home', text: 'Trang Chủ' },
    { id: 2, link: 'services', text: 'Dịch Vụ' },
    { id: 3, link: 'about', text: 'Giới Thiệu' },
    { id: 4, link: 'gallery', text: 'Hình Ảnh' },
    { id: 5, link: 'contact', text: 'Đặt Lịch' },
  ];

  return (
    <nav className="flex justify-between items-center w-full h-20 px-4 text-white bg-black fixed z-50">
      <div>
        <h1 className="text-3xl font-signature ml-2">Serenity Spa</h1>
      </div>

      <ul className="hidden md:flex">
        {links.map(({ id, link, text }) => (
          <li key={id} className="px-4 cursor-pointer capitalize font-medium hover:scale-105 duration-200 text-lg">
            <Link to={link} smooth duration={500}>
              {text}
            </Link>
          </li>
        ))}
      </ul>

      <div onClick={() => setNav(!nav)} className="cursor-pointer pr-4 z-10 text-white md:hidden">
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

      {nav && (
        <ul className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800">
          {links.map(({ id, link, text }) => (
            <li key={id} className="px-4 cursor-pointer capitalize py-6 text-3xl">
              <Link onClick={() => setNav(!nav)} to={link} smooth duration={500}>
                {text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;