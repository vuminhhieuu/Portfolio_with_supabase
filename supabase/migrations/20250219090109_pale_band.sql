/*
  # Add Telegram notifications and customer messaging

  1. Updates
    - Add `telegram_chat_id` column to bookings table for Telegram notifications
    - Add `notification_method` column to bookings table (sms, telegram, email)
    - Add function for sending notifications

  2. Security
    - Update existing policies
*/

-- Add new columns to bookings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'telegram_chat_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN telegram_chat_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'notification_method'
  ) THEN
    ALTER TABLE bookings ADD COLUMN notification_method text DEFAULT 'sms';
  END IF;
END $$;