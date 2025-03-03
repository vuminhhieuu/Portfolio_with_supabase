import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { notifyAdminNewBooking } from '../lib/notifications';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
    bookingDate: '',
    bookingTime: '',
    notificationMethod: 'sms',
    telegramUsername: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!formData.service) {
      toast.error('Vui lòng chọn dịch vụ');
      return false;
    }
    if (!formData.bookingDate) {
      toast.error('Vui lòng chọn ngày');
      return false;
    }
    if (!formData.bookingTime) {
      toast.error('Vui lòng chọn giờ');
      return false;
    }
    if (formData.notificationMethod === 'telegram' && !formData.telegramUsername) {
      toast.error('Vui lòng nhập username Telegram');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Insert booking into database
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            service: formData.service,
            message: formData.message.trim(),
            booking_date: formData.bookingDate,
            booking_time: formData.bookingTime,
            notification_method: formData.notificationMethod,
            telegram_chat_id: formData.telegramUsername,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Send notification to admin
      await notifyAdminNewBooking(data);

      toast.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        service: '',
        message: '',
        bookingDate: '',
        bookingTime: '',
        notificationMethod: 'sms',
        telegramUsername: ''
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const services = [
    'Massage Thư Giãn',
    'Chăm Sóc Da Mặt',
    'Tắm Dưỡng',
    'Liệu Pháp Tinh Dầu'
  ];

  return (
    <div name="contact" className="w-full min-h-screen bg-gradient-to-b from-black to-gray-800 p-4 text-white py-16">
      <Toaster position="top-center" />
      <div className="flex flex-col p-4 justify-center max-w-screen-lg mx-auto h-full">
        <div className="pb-8 text-center">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500">
            Đặt Lịch
          </p>
          <p className="py-6 text-lg">Điền thông tin để đặt lịch hoặc nhận tư vấn</p>
        </div>

        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit} className="flex flex-col w-full md:w-1/2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Họ và tên *"
              className="p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
              required
            />
            
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Số điện thoại *"
              className="my-4 p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="mb-4 p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
            />

            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="mb-4 p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
              required
            >
              <option value="" className="bg-gray-800">Chọn dịch vụ *</option>
              {services.map((service, index) => (
                <option key={index} value={service} className="bg-gray-800">
                  {service}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                min={today}
                className="p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
                required
              />
              
              <input
                type="time"
                name="bookingTime"
                value={formData.bookingTime}
                onChange={handleChange}
                min="09:00"
                max="21:00"
                className="p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Phương thức nhận thông báo *
              </label>
              <select
                name="notificationMethod"
                value={formData.notificationMethod}
                onChange={handleChange}
                className="w-full p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
                required
              >
                <option value="sms" className="bg-gray-800">SMS</option>
                <option value="telegram" className="bg-gray-800">Telegram</option>
              </select>
            </div>

            {formData.notificationMethod === 'telegram' && (
              <input
                type="text"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleChange}
                placeholder="Username Telegram *"
                className="mb-4 p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
                required
              />
            )}

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ghi chú thêm"
              rows="4"
              className="p-3 bg-transparent border-2 rounded-md text-white focus:outline-none focus:border-blue-500 text-lg"
            ></textarea>

            <button
              type="submit"
              disabled={submitting}
              className={`text-white bg-gradient-to-b from-cyan-500 to-blue-500 px-8 py-4 my-8 mx-auto flex items-center rounded-md hover:scale-105 duration-300 text-lg font-medium w-full justify-center ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Đang xử lý...' : 'Gửi Thông Tin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;