-- Safe one-time backfill for users that already have a delivery partner profile
-- but are stored with a non-delivery role.

UPDATE users u
SET role = 'DELIVERY_PARTNER'
WHERE u.role <> 'DELIVERY_PARTNER'
  AND EXISTS (
    SELECT 1
    FROM delivery_partner_profiles dpp
    WHERE dpp.user_id = u.id
  );
