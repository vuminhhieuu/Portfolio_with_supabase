import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const ContentManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
  });

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
      toast.error('Không thể tải dữ liệu dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('services')
        .insert([newService]);

      if (error) throw error;
      
      toast.success('Thêm dịch vụ thành công');
      setNewService({ title: '', description: '', price: '' });
      fetchServices();
    } catch (error) {
      toast.error('Không thể thêm dịch vụ');
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('services')
        .update(editingService)
        .eq('id', editingService.id);

      if (error) throw error;
      
      toast.success('Cập nhật dịch vụ thành công');
      setEditingService(null);
      fetchServices();
    } catch (error) {
      toast.error('Không thể cập nhật dịch vụ');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Xóa dịch vụ thành công');
      fetchServices();
    } catch (error) {
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const ServiceForm = ({ service, onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tên Dịch Vụ</label>
        <input
          type="text"
          value={service.title}
          onChange={(e) => service === newService 
            ? setNewService({...newService, title: e.target.value})
            : setEditingService({...editingService, title: e.target.value})}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Mô Tả</label>
        <textarea
          value={service.description}
          onChange={(e) => service === newService
            ? setNewService({...newService, description: e.target.value})
            : setEditingService({...editingService, description: e.target.value})}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          rows="3"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Giá</label>
        <input
          type="text"
          value={service.price}
          onChange={(e) => service === newService
            ? setNewService({...newService, price: e.target.value})
            : setEditingService({...editingService, price: e.target.value})}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        {service === editingService && (
          <button
            type="button"
            onClick={() => setEditingService(null)}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition duration-200"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Quản Lý Dịch Vụ</h2>
      
      <ServiceForm 
        service={newService}
        onSubmit={handleAddService}
        buttonText="Thêm Dịch Vụ"
      />

      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-900 rounded-lg p-6">
              {editingService?.id === service.id ? (
                <ServiceForm
                  service={editingService}
                  onSubmit={handleUpdateService}
                  buttonText="Cập Nhật"
                />
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-400 mb-2">{service.description}</p>
                  <p className="text-cyan-500 font-semibold">{service.price}</p>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => setEditingService(service)}
                      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition duration-200"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentManagement;