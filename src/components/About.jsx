import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const About = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div name="about" className="w-full min-h-screen bg-gradient-to-b from-black to-gray-800 text-white py-16">
        <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div name="about" className="w-full min-h-screen bg-gradient-to-b from-black to-gray-800 text-white py-16">
      <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-8 text-center">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            Về Chúng Tôi
          </p>
        </div>

        <div className="space-y-8 mt-8">
          {sections.map(({ id, title, content }) => (
            <div key={id} className="text-center px-4">
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-lg text-gray-400">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="text-white px-8 py-3 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer text-lg">
            Tìm Hiểu Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;