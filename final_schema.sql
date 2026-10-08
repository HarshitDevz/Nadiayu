-- Nadiayu Database Schema Migration (Final camelCase)
-- ⚠️ Copy and paste this ENTIRE block into your Supabase SQL Editor on the web dashboard.
-- This bypasses the ENOTFOUND network error entirely!

-- 1. Drop old tables to start fresh
DROP TABLE IF EXISTS professional_profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS kyc_applications CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "googleUserId" VARCHAR(255),
  "fullName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "aadhaarHash" VARCHAR(255) UNIQUE NOT NULL,
  "role" VARCHAR(50) NOT NULL,
  "accountStatus" VARCHAR(50) DEFAULT 'PENDING',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
  "id" VARCHAR(50) PRIMARY KEY,
  "uhid" VARCHAR(100) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "age" INTEGER,
  "gender" VARCHAR(50),
  "bloodGroup" VARCHAR(20),
  "bloodGroupDetails" TEXT,
  "isUniversalDonor" BOOLEAN DEFAULT FALSE,
  "photoUrl" TEXT,
  "emergencyStatus" VARCHAR(50),
  "primaryDiagnosis" TEXT,
  "secondaryConditions" JSONB DEFAULT '[]',
  "organDonor" BOOLEAN DEFAULT FALSE,
  "organDonorCardNumber" VARCHAR(100),
  "nfcTagUid" VARCHAR(100),
  "qrPayload" TEXT,
  "vitals" JSONB,
  "gcs" JSONB,
  "allergies" JSONB DEFAULT '[]',
  "activeMedications" JSONB DEFAULT '[]',
  "emergencyContacts" JSONB DEFAULT '[]',
  "pastMedicalHistory" JSONB DEFAULT '[]',
  "pastPrescriptions" JSONB DEFAULT '[]',
  "interventions" JSONB DEFAULT '[]',
  "notes" TEXT,
  "lastIncidentLocation" TEXT,
  "incidentTime" VARCHAR(100),
  "triageBay" VARCHAR(100)
);

-- 4. Create KYC Applications Table
CREATE TABLE IF NOT EXISTS kyc_applications (
  "id" VARCHAR(50) PRIMARY KEY,
  "applicantName" VARCHAR(255) NOT NULL,
  "age" INTEGER,
  "gender" VARCHAR(50),
  "phone" VARCHAR(50),
  "email" VARCHAR(255),
  "globalId" VARCHAR(100),
  "govtIdType" VARCHAR(100),
  "govtIdNumber" VARCHAR(100) UNIQUE,
  "bloodGroup" VARCHAR(20),
  "organDonor" BOOLEAN DEFAULT FALSE,
  "organDonorCardNumber" VARCHAR(100),
  "photoUrl" TEXT,
  "primaryDiagnosis" TEXT,
  "allergies" JSONB DEFAULT '[]',
  "emergencyContacts" JSONB DEFAULT '[]',
  "pastMedicalHistoryText" TEXT,
  "submittedAt" VARCHAR(100),
  "status" VARCHAR(50) DEFAULT 'PENDING_ADMIN_VERIFICATION',
  "reviewedBy" VARCHAR(255),
  "reviewedAt" VARCHAR(100),
  "rejectionReason" TEXT,
  "allocatedUhid" VARCHAR(100),
  "allocatedPatientId" VARCHAR(50)
);

-- 5. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  "id" VARCHAR(100) PRIMARY KEY,
  "patientId" VARCHAR(50) NOT NULL,
  "patientName" VARCHAR(255),
  "patientUhid" VARCHAR(100),
  "uploadedByNurse" VARCHAR(255),
  "hospitalUnit" VARCHAR(100),
  "uploadedAt" VARCHAR(100),
  "status" VARCHAR(50) DEFAULT 'awaiting_hitl',
  "imageUri" TEXT,
  "imagePresetType" VARCHAR(50),
  "overallConfidence" NUMERIC,
  "extractedText" TEXT,
  "doctorNotes" TEXT,
  "extractedMedications" JSONB DEFAULT '[]',
  "criticalExtract" JSONB DEFAULT '{}',
  "ocrStages" JSONB DEFAULT '[]'
);

-- 6. Disable Row Level Security (RLS) to allow the frontend to instantly connect!
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
