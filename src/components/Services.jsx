import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { supabase } from '../lib/supabase';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div name="services" className="w-full min-h-screen bg-gradient-to-b from-gray-800 to-black text-white py-16">
        <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div name="services" className="w-full min-h-screen bg-gradient-to-b from-gray-800 to-black text-white py-16">
      <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-8 text-center">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            Dịch Vụ
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-6 px-4 sm:px-0">
          {services.map(({ id, title, description, price }) => (
            <div key={id} className="shadow-md shadow-gray-600 rounded-lg p-6 hover:scale-105 duration-300">
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-400 mb-4 text-base">{description}</p>
              <p className="text-cyan-500 font-semibold text-lg">{price}</p>
              <Link to="contact" smooth duration={500}>
                <button className="w-full mt-4 py-2 text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:opacity-90">
                  Đặt Lịch
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;