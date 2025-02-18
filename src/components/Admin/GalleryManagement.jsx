import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState({
    title: '',
    image_url: '',
  });

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
      toast.error('Không thể tải dữ liệu hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('gallery_images')
        .insert([{
          ...newImage,
          order: images.length
        }]);

      if (error) throw error;
      
      toast.success('Thêm hình ảnh thành công');
      setNewImage({ title: '', image_url: '' });
      fetchImages();
    } catch (error) {
      toast.error('Không thể thêm hình ảnh');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) return;
    
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Xóa hình ảnh thành công');
      fetchImages();
    } catch (error) {
      toast.error('Không thể xóa hình ảnh');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === images.length - 1)
    ) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newImages[currentIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[currentIndex]];

    try {
      const updates = newImages.map((img, index) => ({
        id: img.id,
        order: index,
      }));

      const { error } = await supabase
        .from('gallery_images')
        .upsert(updates);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      toast.error('Không thể thay đổi thứ tự');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Quản Lý Hình Ảnh</h2>
      
      <form onSubmit={handleAddImage} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu Đề</label>
          <input
            type="text"
            value={newImage.title}
            onChange={(e) => setNewImage({...newImage, title: e.target.value})}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
          <input
            type="url"
            value={newImage.image_url}
            onChange={(e) => setNewImage({...newImage, image_url: e.target.value})}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
          >
            Thêm Hình Ảnh
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="grid gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="bg-gray-900 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">{image.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(image.id, 'up')}
                      disabled={index === 0}
                      className={`px-3 py-1 rounded ${
                        index === 0 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className={`px-3 py-1 rounded ${
                        index === images.length - 1 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition duration-200 ml-auto"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;