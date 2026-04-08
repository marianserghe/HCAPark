-- HCA Park Events and Contact Tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  rsvp_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attending INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read active events
CREATE POLICY "Public read events" ON events
  FOR SELECT USING (is_active = true);

-- Public can create RSVPs
CREATE POLICY "Public create RSVPs" ON event_rsvps
  FOR INSERT WITH CHECK (true);

-- Public can create contact submissions
CREATE POLICY "Public create contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Admin functions will need authentication
-- For now, these tables are open for development

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample events
INSERT INTO events (title, description, date, time, location) VALUES
('Spring Cleanup Day', 'Join us for our annual spring cleanup! Bring gloves and a smile. We''ll provide bags and refreshments.', '2026-04-26', '9:00 AM', 'HCA Park Main Entrance'),
('Community Cookout', 'Food, fun, and fellowship! Free for members, $5 for non-members.', '2026-05-17', '12:00 PM', 'Park Pavilion'),
('Summer Movie Night', 'Outdoor movie screening for the whole family. Bring blankets and snacks!', '2026-06-14', '8:00 PM', 'Park Amphitheater'),
('Fall Festival', 'Pumpkin carving, games, and autumn treats for everyone.', '2026-10-11', '3:00 PM', 'Park Grounds')
ON CONFLICT DO NOTHING;