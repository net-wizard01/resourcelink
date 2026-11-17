-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    -- geography type handles meters natively (better than geometry for 5km radius)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_type VARCHAR(10) CHECK (listing_type IN ('OFFER', 'REQUEST')),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ledger table (The core of the system)
CREATE TABLE time_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    listing_id UUID REFERENCES listings(id) ON DELETE RESTRICT,
    hours_exchanged NUMERIC(4, 2) CHECK (hours_exchanged > 0),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    idempotency_key UUID UNIQUE NOT NULL, -- Prevents double-spending if the client retries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for speed
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_listings_active ON listings(is_active) WHERE is_active = TRUE;