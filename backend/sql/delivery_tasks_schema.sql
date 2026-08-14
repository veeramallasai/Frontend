CREATE TABLE IF NOT EXISTS delivery_tasks (
  id BIGSERIAL PRIMARY KEY,
  order_code VARCHAR(40) NOT NULL UNIQUE,
  partner_user_id BIGINT NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  pickup_location VARCHAR(300) NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  delivery_location VARCHAR(300) NOT NULL,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  estimated_minutes INTEGER,
  payment_method VARCHAR(30) NOT NULL,
  order_amount NUMERIC(12, 2) NOT NULL,
  earnings_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) NOT NULL,
  scheduled_time TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  customer_rating INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_delivery_task_partner_user
    FOREIGN KEY (partner_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_partner_user
  ON delivery_tasks(partner_user_id);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status
  ON delivery_tasks(status);
