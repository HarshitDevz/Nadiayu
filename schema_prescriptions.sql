-- Nadiayu Database Schema Additions
-- Execute this in your Supabase SQL Editor

-- Create Prescriptions Table (to fix the 404 error)
CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(100) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(255),
  patient_uhid VARCHAR(100),
  uploaded_by_nurse VARCHAR(255),
  hospital_unit VARCHAR(100),
  uploaded_at VARCHAR(100),
  status VARCHAR(50) DEFAULT 'awaiting_hitl',
  image_uri TEXT,
  image_preset_type VARCHAR(50),
  overall_confidence NUMERIC,
  extracted_text TEXT,
  doctor_notes TEXT,
  extracted_medications JSONB DEFAULT '[]',
  critical_extract JSONB DEFAULT '{}',
  ocr_stages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Optional, but good practice if needed later)
-- ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
