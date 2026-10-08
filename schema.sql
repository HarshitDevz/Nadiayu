-- Nadiayu Database Schema Migration
-- Execute this in your Supabase SQL Editor

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_user_id VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  aadhaar_hash VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  account_status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Professional Profiles Table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  professional_type VARCHAR(50) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  specialization VARCHAR(255),
  hospital_name VARCHAR(255) NOT NULL,
  approval_status VARCHAR(50) DEFAULT 'PENDING',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,
  uhid VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  blood_group VARCHAR(20),
  blood_group_details TEXT,
  is_universal_donor BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  emergency_status VARCHAR(50),
  primary_diagnosis TEXT,
  secondary_conditions JSONB DEFAULT '[]',
  organ_donor BOOLEAN DEFAULT FALSE,
  organ_donor_card_number VARCHAR(100),
  nfc_tag_uid VARCHAR(100),
  qr_payload TEXT,
  vitals JSONB,
  gcs JSONB,
  allergies JSONB DEFAULT '[]',
  active_medications JSONB DEFAULT '[]',
  past_medical_history JSONB DEFAULT '[]',
  past_prescriptions JSONB DEFAULT '[]',
  emergency_contacts JSONB DEFAULT '[]',
  interventions JSONB DEFAULT '[]',
  notes TEXT,
  last_incident_location TEXT,
  incident_time TIMESTAMP WITH TIME ZONE,
  triage_bay VARCHAR(100)
);

-- 4. Create KYC Applications Table
CREATE TABLE IF NOT EXISTS kyc_applications (
  id VARCHAR(50) PRIMARY KEY,
  applicant_name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  global_id VARCHAR(100),
  govt_id_type VARCHAR(100),
  govt_id_number VARCHAR(100) UNIQUE,
  blood_group VARCHAR(20),
  organ_donor BOOLEAN DEFAULT FALSE,
  organ_donor_card_number VARCHAR(100),
  photo_url TEXT,
  primary_diagnosis TEXT,
  allergies JSONB DEFAULT '[]',
  emergency_contacts JSONB DEFAULT '[]',
  past_medical_history_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PENDING_ADMIN_VERIFICATION',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  allocated_uhid VARCHAR(100),
  allocated_patient_id VARCHAR(50)
);

-- 5. Enable Row Level Security (Optional but recommended)
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kyc_applications ENABLE ROW LEVEL SECURITY;
