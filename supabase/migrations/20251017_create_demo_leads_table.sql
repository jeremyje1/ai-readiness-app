-- Create demo_leads table for Education AI Blueprint marketing demo
CREATE TABLE IF NOT EXISTS demo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  role TEXT NOT NULL,
  
  -- Tracking & Attribution
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Assessment Data
  responses JSONB,
  overall_score INTEGER,
  readiness_level TEXT,
  category_scores JSONB,
  quick_wins JSONB,
  estimated_impact JSONB,
  
  -- Lead Qualification
  lead_qualification TEXT CHECK (lead_qualification IN ('HOT', 'WARM', 'COLD')),
  
  -- Follow-up Tracking
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  demo_scheduled BOOLEAN DEFAULT FALSE,
  demo_scheduled_at TIMESTAMPTZ,
  demo_completed BOOLEAN DEFAULT FALSE,
  demo_completed_at TIMESTAMPTZ,
  converted_to_customer BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_leads_email ON demo_leads(email);
CREATE INDEX IF NOT EXISTS idx_demo_leads_created_at ON demo_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_leads_completed_at ON demo_leads(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_leads_lead_qualification ON demo_leads(lead_qualification);
CREATE INDEX IF NOT EXISTS idx_demo_leads_contacted ON demo_leads(contacted) WHERE contacted = FALSE;
CREATE INDEX IF NOT EXISTS idx_demo_leads_demo_scheduled ON demo_leads(demo_scheduled) WHERE demo_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_demo_leads_institution_type ON demo_leads(institution_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_demo_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER demo_leads_updated_at
  BEFORE UPDATE ON demo_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_demo_leads_updated_at();

-- Add RLS policies
ALTER TABLE demo_leads ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role can do everything with demo_leads"
  ON demo_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own leads (by email)
CREATE POLICY "Users can read their own demo leads"
  ON demo_leads
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() -> 'email')::text);

-- Allow anonymous users to create leads (for public demo form)
CREATE POLICY "Anyone can create demo leads"
  ON demo_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create view for sales dashboard
CREATE OR REPLACE VIEW demo_leads_dashboard AS
SELECT
  id,
  first_name || ' ' || last_name AS full_name,
  email,
  institution_name,
  institution_type,
  role,
  overall_score,
  readiness_level,
  lead_qualification,
  contacted,
  demo_scheduled,
  converted_to_customer,
  started_at,
  completed_at,
  CASE
    WHEN completed_at IS NOT NULL THEN 'Completed'
    WHEN started_at IS NOT NULL THEN 'In Progress'
    ELSE 'New'
  END AS status,
  EXTRACT(EPOCH FROM (completed_at - started_at)) / 60 AS completion_time_minutes,
  utm_source,
  utm_campaign
FROM demo_leads
WHERE completed_at IS NOT NULL
ORDER BY completed_at DESC;

-- Grant access to view
GRANT SELECT ON demo_leads_dashboard TO service_role;
GRANT SELECT ON demo_leads_dashboard TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE demo_leads IS 'Stores leads captured from Education AI Blueprint demo assessment';
COMMENT ON COLUMN demo_leads.responses IS 'JSON object mapping question IDs to answer values (0-4)';
COMMENT ON COLUMN demo_leads.category_scores IS 'JSON object with category names and percentage scores';
COMMENT ON COLUMN demo_leads.quick_wins IS 'JSON array of personalized quick win recommendations';
COMMENT ON COLUMN demo_leads.estimated_impact IS 'JSON object with cost savings, time saved, and efficiency gain estimates';
COMMENT ON COLUMN demo_leads.lead_qualification IS 'HOT (high score + decision maker), WARM (medium score or high score), COLD (low score)';
