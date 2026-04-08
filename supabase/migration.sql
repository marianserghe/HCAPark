-- HCA Park Dues Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households table
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  house_number TEXT NOT NULL,
  street TEXT NOT NULL,
  full_address TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  spouse TEXT,
  phone TEXT,
  email TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_households_street ON households(street);
CREATE INDEX IF NOT EXISTS idx_households_status ON households(status);
CREATE INDEX IF NOT EXISTS idx_households_location ON households(latitude, longitude);

-- Payments table (for Stripe integration later)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('stripe', 'venmo', 'check', 'cash')),
  stripe_payment_id TEXT,
  stripe_receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for payments
CREATE INDEX IF NOT EXISTS idx_payments_household ON payments(household_id);

-- Settings table (for admin config)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  dues_amount DECIMAL(10, 2) DEFAULT 50.00,
  due_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (year, dues_amount) 
VALUES (EXTRACT(YEAR FROM NOW()), 50.00)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public can read households (for map view)
CREATE POLICY "Public read households" ON households
  FOR SELECT USING (true);

-- Public can update household status (for payment flow)
-- In production, you'd want to restrict this more
CREATE POLICY "Public update households" ON households
  FOR UPDATE USING (true);

-- Public can read payments (for receipts)
CREATE POLICY "Public read payments" ON payments
  FOR SELECT USING (true);

-- Public can insert payments
CREATE POLICY "Public insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Public can read settings
CREATE POLICY "Public read settings" ON settings
  FOR SELECT USING (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on households
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();