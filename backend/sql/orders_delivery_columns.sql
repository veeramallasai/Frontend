-- Delivery estimation columns for order persistence.
-- Apply this only in the service/database that owns the orders table.
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(500),
ADD COLUMN IF NOT EXISTS delivery_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS delivery_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS origin_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS origin_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS distance_km DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS estimated_travel_minutes INTEGER,
ADD COLUMN IF NOT EXISTS preparation_minutes INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER,
ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMP;
