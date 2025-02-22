import { supabase } from './supabase';
import { sendCustomerNotification } from './notifications';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

export const handleTelegramCommand = async (message) => {
  const text = message.text.toLowerCase();
  const chatId = message.chat.id;
  
  // Only allow commands from admin
  if (chatId.toString() !== TELEGRAM_ADMIN_CHAT_ID) {
    return;
  }

  try {
    if (text === '/start' || text === 'menu') {
      await sendMainMenu(chatId);
      return;
    }

    if (text === 'danh sách đặt lịch') {
      await sendBookingList(chatId);
      return;
    }

    if (text === 'thống kê') {
      await sendRevenueStats(chatId);
      return;
    }

    // Check if it's a booking selection
    if (text.startsWith('chọn #')) {
      const bookingId = text.split('#')[1];
      await selectBooking(chatId, bookingId);
      return;
    }

    // Handle status updates
    const bookingId = await getContextBookingId(chatId);
    if (!bookingId) {
      await sendTelegramMessage(chatId, 'Vui lòng chọn một đặt lịch trước khi thực hiện thao tác');
      return;
    }

    switch (text) {
      case 'xác nhận':
        await updateBookingStatus(bookingId, 'confirmed');
        await sendTelegramMessage(chatId, '✅ Đã xác nhận đặt lịch');
        break;
      
      case 'hủy':
        await updateBookingStatus(bookingId, 'cancelled');
        await sendTelegramMessage(chatId, '❌ Đã hủy đặt lịch');
        break;
      
      case 'hoàn thành':
        await updateBookingStatus(bookingId, 'completed');
        await sendTelegramMessage(chatId, '🎉 Đã hoàn thành đặt lịch');
        break;

      default:
        await sendTelegramMessage(chatId, 'Lệnh không hợp lệ. Gõ "menu" để xem danh sách lệnh.');
    }
  } catch (error) {
    console.error('Error handling telegram command:', error);
    await sendTelegramMessage(chatId, 'Có lỗi xảy ra khi xử lý yêu cầu');
  }
};

const sendMainMenu = async (chatId) => {
  const menu = `*Menu Quản Lý*\n\n` +
    `- Danh sách đặt lịch\n` +
    `- Thống kê\n\n` +
    `*Lệnh cho đặt lịch đã chọn:*\n` +
    `- Xác nhận\n` +
    `- Hủy\n` +
    `- Hoàn thành`;

  await sendTelegramMessage(chatId, menu);
};

const sendBookingList = async (chatId) => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('visible', true)
    .order('booking_date', { ascending: true });

  if (error) throw error;

  if (!bookings.length) {
    await sendTelegramMessage(chatId, 'Không có đặt lịch nào');
    return;
  }

  let message = '*Danh sách đặt lịch*\n\n';
  bookings.forEach(booking => {
    message += `#${booking.id}\n` +
      `Khách hàng: ${booking.name}\n` +
      `Dịch vụ: ${booking.service}\n` +
      `Ngày: ${booking.booking_date}\n` +
      `Giờ: ${booking.booking_time}\n` +
      `Trạng thái: ${getStatusEmoji(booking.status)}\n\n`;
  });

  message += 'Để chọn đặt lịch, gõ "chọn #[id]"';
  await sendTelegramMessage(chatId, message);
};

const sendRevenueStats = async (chatId) => {
  const { data: stats, error } = await supabase
    .from('revenue_tracking')
    .select('*')
    .order('period_start', { ascending: false })
    .limit(30);

  if (error) throw error;

  let message = '📊 *Thống kê doanh thu*\n\n';

  // Group by period type
  const byPeriod = stats.reduce((acc, stat) => {
    if (!acc[stat.period_type]) {
      acc[stat.period_type] = [];
    }
    acc[stat.period_type].push(stat);
    return acc;
  }, {});

  // Format monthly stats
  if (byPeriod.monthly) {
    message += '*Theo tháng:*\n';
    byPeriod.monthly.slice(0, 3).forEach(stat => {
      message += formatRevenueStats(stat);
    });
  }

  // Format weekly stats
  if (byPeriod.weekly) {
    message += '\n*Theo tuần:*\n';
    byPeriod.weekly.slice(0, 4).forEach(stat => {
      message += formatRevenueStats(stat);
    });
  }

  await sendTelegramMessage(chatId, message);
};

const formatRevenueStats = (stat) => {
  const date = new Date(stat.period_start);
  const period = stat.period_type === 'monthly' 
    ? date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : `Tuần ${getWeekNumber(date)}`;

  return `${period}\n` +
    `Doanh thu: ${formatCurrency(stat.total_revenue)}\n` +
    `Đặt lịch: ${stat.total_bookings} (✅${stat.completed_bookings} ❌${stat.cancelled_bookings})\n\n`;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const selectBooking = async (chatId, bookingId) => {
  try {
    // Check if booking exists
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      await sendTelegramMessage(chatId, 'Không tìm thấy đặt lịch');
      return;
    }

    // Update context
    await supabase
      .from('booking_context')
      .upsert({
        chat_id: chatId,
        booking_id: bookingId
      });

    // Send booking details
    const message = `*Đã chọn đặt lịch:*\n\n` +
      `Khách hàng: ${booking.name}\n` +
      `SĐT: ${booking.phone}\n` +
      `Dịch vụ: ${booking.service}\n` +
      `Ngày: ${booking.booking_date}\n` +
      `Giờ: ${booking.booking_time}\n` +
      `Trạng thái: ${getStatusEmoji(booking.status)}\n\n` +
      `*Các lệnh có thể thực hiện:*\n` +
      `- Xác nhận\n` +
      `- Hủy\n` +
      `- Hoàn thành`;

    await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('Error selecting booking:', error);
    await sendTelegramMessage(chatId, 'Có lỗi xảy ra khi chọn đặt lịch');
  }
};

const getStatusEmoji = (status) => {
  switch (status) {
    case 'pending': return '⏳ Chờ xử lý';
    case 'confirmed': return '✅ Đã xác nhận';
    case 'completed': return '🎉 Hoàn thành';
    case 'cancelled': return '❌ Đã hủy';
    default: return status;
  }
};

const updateBookingStatus = async (bookingId, status) => {
  try {
    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    // Update status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status,
        visible: status !== 'completed'
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // Send notification to customer
    await sendCustomerNotification(booking, status);

    // Create notification
    await supabase
      .from('notifications')
      .insert([{
        type: `booking_${status}`,
        content: `${booking.name} - ${booking.service} - ${status}`,
        booking_id: bookingId
      }]);

  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

const getContextBookingId = async (chatId) => {
  const { data, error } = await supabase
    .from('booking_context')
    .select('booking_id')
    .eq('chat_id', chatId)
    .single();

  if (error || !data) return null;
  return data.booking_id;
};

const sendTelegramMessage = async (chatId, text) => {
  try {
    const response = await fetch(`${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Error sending telegram message:', error);
    return false;
  }
};