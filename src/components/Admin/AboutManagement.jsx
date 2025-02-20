import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const AboutManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
  });
  console.log(sections);
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
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('about_sections')
        .insert([{
          ...newSection,
          order: sections.length
        }]);

      if (error) throw error;
      
      toast.success('Thêm nội dung thành công');
      setNewSection({ title: '', content: '' });
      fetchSections();
    } catch (error) {
      toast.error('Không thể thêm nội dung');
    }
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('about_sections')
        .update(editingSection)
        .eq('id', editingSection.id);

      if (error) throw error;
      
      toast.success('Cập nhật nội dung thành công');
      setEditingSection(null);
      fetchSections();
    } catch (error) {
      toast.error('Không thể cập nhật nội dung');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nội dung này?')) return;
    
    try {
      const { error } = await supabase
        .from('about_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Xóa nội dung thành công');
      fetchSections();
    } catch (error) {
      toast.error('Không thể xóa nội dung');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = sections.findIndex(section => section.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSections[currentIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[currentIndex]];

    try {
      const updates = newSections.map((section, index) => ({
        id: section.id,
        order: index,
      }));

      const { error } = await supabase
        .from('about_sections')
        .upsert(updates);

      if (error) throw error;
      fetchSections();
    } catch (error) {
      toast.error('Không thể thay đổi thứ tự');
    }
  };

  const SectionForm = ({ section, onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg mb-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tiêu Đề</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => section === newSection
            ? setNewSection({...newSection, title: e.target.value})
            : setEditingSection({...editingSection, title: e.target.value})}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Nội Dung</label>
        <textarea
          value={section.content}
          onChange={(e) => section === newSection
            ? setNewSection({...newSection, content: e.target.value})
            : setEditingSection({...editingSection, content: e.target.value})}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          rows="4"
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        {section === editingSection && (
          <button
            type="button"
            onClick={() => setEditingSection(null)}
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
      <h2 className="text-2xl font-bold mb-6">Quản Lý Nội Dung Giới Thiệu</h2>
      
      <SectionForm
        section={newSection}
        onSubmit={handleAddSection}
        buttonText="Thêm Nội Dung"
      />

      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-gray-900 rounded-lg p-6">
              {editingSection?.id === section.id ? (
                <SectionForm
                  section={editingSection}
                  onSubmit={handleUpdateSection}
                  buttonText="Cập Nhật"
                />
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-gray-400 mb-4">{section.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(section.id, 'up')}
                      disabled={index === 0}
                      className={`px-3 py-1 rounded ${
                        index === 0 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className={`px-3 py-1 rounded ${
                        index === sections.length - 1 ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setEditingSection(section)}
                      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition duration-200 ml-auto"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
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

export default AboutManagement;