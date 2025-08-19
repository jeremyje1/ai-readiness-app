-- This script should be run in the Supabase SQL editor or via Supabase CLI
-- It adds consultation booking functionality to the database

-- Create consultation_bookings table
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  consultation_type VARCHAR(50) NOT NULL CHECK (consultation_type IN ('strategic', 'implementation', 'follow-up')),
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  message TEXT,
  organization_size VARCHAR(20) NOT NULL CHECK (organization_size IN ('small', 'medium', 'large', 'enterprise')),
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  scheduled_duration INTEGER DEFAULT 60, -- minutes
  meeting_url TEXT,
  consultant_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user_id ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_assessment_id ON consultation_bookings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_scheduled_date ON consultation_bookings(scheduled_date);

-- Add RLS policies
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookings
DROP POLICY IF EXISTS "Users can view own consultation bookings" ON consultation_bookings;
CREATE POLICY "Users can view own consultation bookings" ON consultation_bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own bookings
DROP POLICY IF EXISTS "Users can create own consultation bookings" ON consultation_bookings;
CREATE POLICY "Users can create own consultation bookings" ON consultation_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own bookings (limited fields)
DROP POLICY IF EXISTS "Users can update own consultation bookings" ON consultation_bookings;
CREATE POLICY "Users can update own consultation bookings" ON consultation_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
