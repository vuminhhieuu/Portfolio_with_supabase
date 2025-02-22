import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { sendCustomerNotification } from '../../lib/notifications';
import BookingStats from './BookingStats'

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
    
    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, handleNewNotification)
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  const handleNewNotification = async (payload) => {
    const booking = payload.new;
    
    toast.success('Có đặt lịch mới!', {
      duration: 5000,
      icon: '🔔'
    });
    fetchNotifications();
    fetchBookings();
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      toast.error('Không thể tải thông báo');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const booking = bookings.find(b => b.id === id);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          visible: status !== 'completed'
        })
        .eq('id', id);

      if (error) throw error;

      // Notify customer about status change
      const notificationSent = await sendCustomerNotification(booking, status);
      
      if (notificationSent) {
        toast.success('Đã gửi thông báo cho khách hàng');
      }

      // Create notification for status change
      await supabase
        .from('notifications')
        .insert([{
          type: `booking_${status}`,
          content: `${booking.name} - ${booking.service} - ${status}`,
          booking_id: id
        }]);

      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      toast.error('Không thể cập nhật thông báo');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'confirmed': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản Lý Đặt Lịch</h2>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          {showStats ? 'Ẩn Thống Kê' : 'Xem Thống Kê'}
        </button>
      </div>

      {showStats && <BookingStats />}

      {/* Notifications Section */}
      {unreadCount > 0 && (
        <div className="bg-blue-900 p-4 rounded-lg mb-4">
          <h3 className="text-xl font-semibold mb-2">
            Thông Báo Mới ({unreadCount})
          </h3>
          <div className="space-y-2">
            {notifications
              .filter(n => !n.read)
              .map(notification => (
                <div
                  key={notification.id}
                  className="bg-blue-800 p-3 rounded flex justify-between items-center"
                >
                  <span>{notification.content}</span>
                  <button
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="text-sm bg-blue-700 px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bookings Section */}
      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gray-900 rounded-lg p-6 shadow-md"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{booking.name}</h3>
                  <p className="text-gray-400">SĐT: {booking.phone}</p>
                  {booking.email && (
                    <p className="text-gray-400">Email: {booking.email}</p>
                  )}
                  <p className="text-gray-400">Dịch vụ: {booking.service}</p>
                  <p className="text-gray-400">
                    Ngày: {format(new Date(booking.booking_date), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-gray-400">
                    Giờ: {booking.booking_time}
                  </p>
                  {booking.message && (
                    <p className="text-gray-400">Ghi chú: {booking.message}</p>
                  )}
                  <p className="text-gray-400">
                    Thông báo: {booking.notification_method === 'telegram' ? 'Telegram' : 'SMS'}
                  </p>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex gap-2 justify-end">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className={`bg-gray-800 border border-gray-700 rounded px-3 py-2 ${getStatusColor(booking.status)}`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <p className="text-right text-sm text-gray-400 mt-4">
                    Đặt lịch: {format(new Date(booking.created_at), 'HH:mm dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingManagement;