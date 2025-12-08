-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add the updated constraint with all necessary statuses
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'pending_approval', 'completed', 'failed', 'rejected', 'cancelled'));

-- Reload schema
NOTIFY pgrst, 'reload schema';
