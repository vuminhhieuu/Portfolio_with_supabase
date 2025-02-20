/*
  # Add notifications system and booking improvements

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text) - loại thông báo (booking_new, booking_confirmed, etc)
      - `content` (text) - nội dung thông báo
      - `read` (boolean) - trạng thái đã đọc
      - `created_at` (timestamptz)
      - `booking_id` (uuid) - reference to bookings table

  2. Updates
    - Add `email` column to bookings table
    - Add `notification_sent` column to bookings table

  3. Security
    - Enable RLS on notifications table
    - Add policies for authenticated users
*/

-- Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE
);

-- Add new columns to bookings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'notification_sent'
  ) THEN
    ALTER TABLE bookings ADD COLUMN notification_sent boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS and add policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage notifications"
  ON notifications
  USING (auth.role() = 'authenticated');

-- Add function to create notification
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, content, booking_id)
  VALUES (
    'booking_new',
    'Đặt lịch mới từ ' || NEW.name || ' - ' || NEW.service || ' - ' || NEW.booking_date || ' ' || NEW.booking_time,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for new bookings
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_notification();