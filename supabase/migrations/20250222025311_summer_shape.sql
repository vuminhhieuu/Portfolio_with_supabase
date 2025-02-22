/*
  # Add booking management features
  
  1. Changes
    - Add visible column to bookings table
    - Add price column to bookings table
    - Add booking_context table for telegram commands
    - Add revenue_tracking view
  
  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Add visible column to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0;

-- Create booking context table for telegram
CREATE TABLE IF NOT EXISTS booking_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE booking_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage booking context"
  ON booking_context
  USING (auth.role() = 'authenticated');

-- Create revenue tracking view
CREATE OR REPLACE VIEW revenue_tracking AS
WITH monthly_revenue AS (
  SELECT 
    date_trunc('month', booking_date) as month,
    SUM(price) as total_revenue,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
  FROM bookings
  GROUP BY date_trunc('month', booking_date)
),
weekly_revenue AS (
  SELECT 
    date_trunc('week', booking_date) as week,
    SUM(price) as total_revenue,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
  FROM bookings
  GROUP BY date_trunc('week', booking_date)
),
daily_revenue AS (
  SELECT 
    date_trunc('day', booking_date) as day,
    SUM(price) as total_revenue,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
  FROM bookings
  GROUP BY date_trunc('day', booking_date)
)
SELECT 
  'monthly' as period_type,
  month as period_start,
  total_revenue,
  total_bookings,
  completed_bookings,
  cancelled_bookings
FROM monthly_revenue
UNION ALL
SELECT 
  'weekly' as period_type,
  week as period_start,
  total_revenue,
  total_bookings,
  completed_bookings,
  cancelled_bookings
FROM weekly_revenue
UNION ALL
SELECT 
  'daily' as period_type,
  day as period_start,
  total_revenue,
  total_bookings,
  completed_bookings,
  cancelled_bookings
FROM daily_revenue;