-- ScholarNest Supabase / PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor or psql to initialize the database tables, constraints, and indexes.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- 2. STUDENTS TABLE (Profile details linked to User)
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    age INTEGER,
    state VARCHAR(100),
    district VARCHAR(100),
    course VARCHAR(150),
    branch VARCHAR(150),
    year VARCHAR(50),
    college_name VARCHAR(255),
    college_type VARCHAR(100),
    cgpa NUMERIC(4, 2) DEFAULT 0.0,
    percentage NUMERIC(5, 2) DEFAULT 0.0,
    annual_family_income NUMERIC(12, 2) DEFAULT 0.0,
    category VARCHAR(100),
    gender VARCHAR(50),
    disability_status BOOLEAN DEFAULT FALSE,
    minority_status BOOLEAN DEFAULT FALSE,
    rural_urban VARCHAR(50) DEFAULT 'Urban',
    previous_scholarship BOOLEAN DEFAULT FALSE,
    achievements TEXT,
    profile_completion INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- ============================================================================
-- 3. SCHOLARSHIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    course_eligibility JSONB DEFAULT '[]'::jsonb,
    minimum_cgpa NUMERIC(4, 2) DEFAULT 0.0,
    maximum_income NUMERIC(12, 2) DEFAULT 0.0,
    eligible_states JSONB DEFAULT '[]'::jsonb,
    eligible_categories JSONB DEFAULT '[]'::jsonb,
    gender_requirement VARCHAR(50) DEFAULT 'All',
    age_requirement INTEGER DEFAULT 100,
    required_documents JSONB DEFAULT '[]'::jsonb,
    deadline DATE NOT NULL,
    official_url TEXT NOT NULL,
    application_method VARCHAR(100) DEFAULT 'Online Portal',
    verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON scholarships(status);

-- ============================================================================
-- 4. SAVED_SCHOLARSHIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_scholarship_saved UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user ON saved_scholarships(user_id);

-- ============================================================================
-- 5. APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'SAVED' CHECK (status IN (
        'SAVED',
        'INTERESTED',
        'DOCUMENTS_PREPARING',
        'READY_TO_APPLY',
        'APPLIED',
        'UNDER_REVIEW',
        'SELECTED',
        'REJECTED'
    )),
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_scholarship_application UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ============================================================================
-- 6. DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'Under Review' CHECK (verification_status IN (
        'Ready',
        'Needs Attention',
        'Missing',
        'Under Review'
    )),
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================================
-- 8. AI_OUTPUTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    input_hash VARCHAR(64),
    output_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_outputs_user_type ON ai_outputs(user_id, type);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_hash ON ai_outputs(input_hash);
