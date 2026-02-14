-- Create inspections table for crop disease analysis
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_name TEXT NOT NULL,
  
  -- Crop identification
  crop_type TEXT NOT NULL,
  crop_type_tamil TEXT,
  
  -- Health analysis
  health_status TEXT NOT NULL CHECK (health_status IN ('Healthy', 'Stressed', 'Diseased')),
  disease_name TEXT,
  disease_name_tamil TEXT,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Details
  symptoms TEXT,
  symptoms_tamil TEXT,
  severity TEXT CHECK (severity IN ('Mild', 'Moderate', 'Severe', NULL)),
  
  -- Image
  image_url TEXT NOT NULL,
  
  -- Recommendations
  treatment JSONB DEFAULT '[]'::jsonb,
  treatment_tamil JSONB DEFAULT '[]'::jsonb,
  prevention JSONB DEFAULT '[]'::jsonb,
  prevention_tamil JSONB DEFAULT '[]'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_user ON inspections(user_name);
CREATE INDEX IF NOT EXISTS idx_inspections_health ON inspections(health_status);

-- Enable Row Level Security (optional, for production)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON inspections
  FOR ALL
  USING (true)
  WITH CHECK (true);
