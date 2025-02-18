/*
  # Add content management tables

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gallery_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `order` (integer)

    - `about_sections`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `order` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage content
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for services"
  ON services
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage services"
  ON services
  USING (auth.role() = 'authenticated');

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  "order" integer DEFAULT 0
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for gallery_images"
  ON gallery_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage gallery_images"
  ON gallery_images
  USING (auth.role() = 'authenticated');

-- About sections table
CREATE TABLE IF NOT EXISTS about_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  "order" integer DEFAULT 0
);

ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for about_sections"
  ON about_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage about_sections"
  ON about_sections
  USING (auth.role() = 'authenticated');

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_about_sections_updated_at
  BEFORE UPDATE ON about_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();