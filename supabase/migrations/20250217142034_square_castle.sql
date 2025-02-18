/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `name` (text)
      - `phone` (text)
      - `service` (text)
      - `message` (text)
      - `booking_date` (date)
      - `booking_time` (time)
      - `status` (text)

  2. Security
    - Enable RLS on `bookings` table
    - Add policies for inserting and viewing bookings
*/
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  message text,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'pending'
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);