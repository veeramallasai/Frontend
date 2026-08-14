CREATE TABLE IF NOT EXISTS product_price_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    market_price DOUBLE PRECISION NOT NULL,
    selling_price DOUBLE PRECISION NOT NULL,
    profit_margin DOUBLE PRECISION NOT NULL,
    price_source VARCHAR(120),
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
