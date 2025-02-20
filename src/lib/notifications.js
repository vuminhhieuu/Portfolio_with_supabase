import TelegramBot from 'node-telegram-bot-api';
import twilio from 'twilio';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
console.log(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER);

// Initialize Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendTelegramNotification = async (message) => {
  try {
    await bot.sendMessage(TELEGRAM_ADMIN_CHAT_ID, message);
    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
};

export const sendSMSNotification = async (phoneNumber, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return true;
  } catch (error) {
    console.error('SMS notification error:', error);
    return false;
  }
};

export const sendCustomerNotification = async (booking, status) => {
  const statusMessages = {
    confirmed: 'Lịch hẹn của bạn đã được xác nhận',
    completed: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi',
    cancelled: 'Lịch hẹn của bạn đã bị hủy'
  };

  const message = `${statusMessages[status]}\n\nDịch vụ: ${booking.service}\nNgày: ${booking.booking_date}\nGiờ: ${booking.booking_time}`;

  if (booking.notification_method === 'telegram' && booking.telegram_chat_id) {
    return sendTelegramNotification(message);
  } else if (booking.phone) {
    return sendSMSNotification(booking.phone, message);
  }
  return false;
};

export const notifyAdminNewBooking = async (booking) => {
  const message = `🔔 Đặt lịch mới!\n\nKhách hàng: ${booking.name}\nSĐT: ${booking.phone}\nDịch vụ: ${booking.service}\nNgày: ${booking.booking_date}\nGiờ: ${booking.booking_time}`;
  return sendTelegramNotification(message);
};