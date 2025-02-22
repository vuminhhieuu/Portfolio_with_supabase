// Telegram API endpoint
const TELEGRAM_API = 'https://api.telegram.org/bot';
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

export const sendTelegramNotification = async (message, chatId = TELEGRAM_ADMIN_CHAT_ID) => {
  try {
    const response = await fetch(`${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
};

export const sendCustomerNotification = async (booking, status) => {
  if (!booking) return false;

  const statusMessages = {
    confirmed: '✅ Lịch hẹn của bạn đã được xác nhận',
    completed: '🎉 Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi',
    cancelled: '❌ Lịch hẹn của bạn đã bị hủy'
  };

  const message = `<b>${statusMessages[status]}</b>\n\n` +
    `<b>Khách hàng:</b> ${booking.name}\n` +
    `<b>Dịch vụ:</b> ${booking.service}\n` +
    `<b>Ngày:</b> ${booking.booking_date}\n` +
    `<b>Giờ:</b> ${booking.booking_time}\n\n` +
    `Mọi thắc mắc xin liên hệ hotline: 0123.456.789`;

  if (booking.notification_method === 'telegram' && booking.telegram_chat_id) {
    const sent = await sendTelegramNotification(message, booking.telegram_chat_id);
    return sent;
  }
  return false;
};

export const notifyAdminNewBooking = async (booking) => {
  if (!booking) return false;

  const message = 
    `🔔 <b>Đặt lịch mới!</b>\n\n` +
    `<b>Khách hàng:</b> ${booking.name}\n` +
    `<b>SĐT:</b> ${booking.phone}\n` +
    `<b>Email:</b> ${booking.email || 'Không có'}\n` +
    `<b>Dịch vụ:</b> ${booking.service}\n` +
    `<b>Ngày:</b> ${booking.booking_date}\n` +
    `<b>Giờ:</b> ${booking.booking_time}\n` +
    `<b>Ghi chú:</b> ${booking.message || 'Không có'}\n` +
    `<b>Phương thức thông báo:</b> ${booking.notification_method}\n` +
    (booking.telegram_chat_id ? `<b>Telegram:</b> ${booking.telegram_chat_id}\n` : '');

  return sendTelegramNotification(message);
};