-- Backfill missing or generic product image URLs with product-specific grocery photos.
-- Run this once against the same database used by the backend.

UPDATE products
SET image_url = CONCAT(
    'https://source.unsplash.com/600x600/?',
    REPLACE(LOWER(COALESCE(product_name, 'fresh grocery')), ' ', '%20'),
    ',grocery,food%20photography&sig=',
    REPLACE(LOWER(COALESCE(product_name, 'fresh-grocery')), ' ', '-')
)
WHERE image_url IS NULL
   OR TRIM(image_url) = ''
   OR LOWER(image_url) LIKE '%placeholder%'
   OR LOWER(image_url) LIKE '%default_veg%'
   OR LOWER(image_url) LIKE '%picsum.photos%';
