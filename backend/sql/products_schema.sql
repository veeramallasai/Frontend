-- PostgreSQL schema for product management module
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(20) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price DOUBLE PRECISION NOT NULL CHECK (price > 0),
    quantity DOUBLE PRECISION NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    farmer_name VARCHAR(150) NOT NULL,
    farmer_location VARCHAR(200) NOT NULL,
    stock_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
