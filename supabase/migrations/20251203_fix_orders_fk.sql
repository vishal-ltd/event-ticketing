-- Add foreign key from orders.user_id to user_profiles.id
-- This allows PostgREST to detect the relationship and enable joins.

ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES user_profiles(id);

-- Reload schema
NOTIFY pgrst, 'reload schema';
