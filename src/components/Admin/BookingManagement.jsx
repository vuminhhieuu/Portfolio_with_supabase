import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
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
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div>
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
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex gap-2 justify-end">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
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