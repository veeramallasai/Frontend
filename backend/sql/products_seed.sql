-- Product sample data for the Farm to Home product module
-- Schema expected: products(id, product_name, category, description, price, quantity, unit, image_url, farmer_name, farmer_location, stock_status, created_at)

INSERT INTO products (
    product_name,
    category,
    description,
    price,
    quantity,
    unit,
    image_url,
    farmer_name,
    farmer_location,
    stock_status,
    created_at
) VALUES
('Apple', 'FRUIT', 'Fresh premium apples sourced from trusted local farms.', 120.0, 35.0, 'KG', 'uploads/products/apple.jpg', 'Ramesh Reddy', 'Guntur, Andhra Pradesh', 'AVAILABLE', NOW()),
('Banana', 'FRUIT', 'Naturally ripened bananas, perfect for daily nutrition.', 60.0, 120.0, 'DOZEN', 'uploads/products/banana.jpg', 'Lakshmi Devi', 'Nashik, Maharashtra', 'AVAILABLE', NOW()),
('Mango', 'FRUIT', 'Seasonal mangoes with rich flavor and natural sweetness.', 180.0, 48.0, 'KG', 'uploads/products/mango.jpg', 'Kiran Kumar', 'Mysuru, Karnataka', 'AVAILABLE', NOW()),
('Orange', 'FRUIT', 'Juicy oranges harvested fresh for citrus lovers.', 90.0, 80.0, 'DOZEN', 'uploads/products/orange.jpg', 'Anitha Naidu', 'Coimbatore, Tamil Nadu', 'AVAILABLE', NOW()),
('Potato', 'VEGETABLE', 'Farm fresh potatoes sorted and packed hygienically.', 40.0, 250.0, 'KG', 'uploads/products/potato.jpg', 'Pavitra Gowda', 'Kurnool, Andhra Pradesh', 'AVAILABLE', NOW()),
('Onion', 'VEGETABLE', 'Red onions directly sourced from local farmers.', 35.0, 0.0, 'KG', 'uploads/products/onion.jpg', 'Arjun Singh', 'Madikeri, Karnataka', 'OUT_OF_STOCK', NOW()),
('Tomato', 'VEGETABLE', 'Fresh tomatoes ideal for curries and salads.', 50.0, 90.0, 'KG', 'uploads/products/tomato.jpg', 'Divya Patel', 'Nalgonda, Telangana', 'AVAILABLE', NOW()),
('Carrot', 'VEGETABLE', 'Crunchy carrots with high nutritional value.', 70.0, 55.0, 'KG', 'uploads/products/carrot.jpg', 'Mahesh Babu', 'Chittoor, Andhra Pradesh', 'AVAILABLE', NOW()),
('Green Chilli', 'VEGETABLE', 'Fresh green chillies with medium spice level.', 30.0, 75.0, 'GRAM', 'uploads/products/green-chilli.jpg', 'Sunita Choudhary', 'Hubballi, Karnataka', 'AVAILABLE', NOW()),
('Cucumber', 'VEGETABLE', 'Hydrating cucumbers freshly harvested.', 45.0, 100.0, 'KG', 'uploads/products/cucumber.jpg', 'Naveen Rao', 'Nagpur, Maharashtra', 'AVAILABLE', NOW());
