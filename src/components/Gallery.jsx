import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div name="gallery" className="bg-gradient-to-b from-gray-800 to-black w-full min-h-screen text-white">
        <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div name="gallery" className="bg-gradient-to-b from-gray-800 to-black w-full min-h-screen text-white">
      <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-8">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            Gallery
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-8 px-12 sm:px-0">
          {images.map(({ id, title, image_url }) => (
            <div key={id} className="shadow-md shadow-gray-600 rounded-lg">
              <img
                src={image_url}
                alt={title}
                className="rounded-md duration-200 hover:scale-105 w-full h-48 object-cover"
              />
              <div className="flex items-center justify-center">
                <p className="p-4 text-center">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;