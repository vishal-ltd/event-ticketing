-- 1. Try to drop the check constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- 2. If it's a CHECK constraint, add the updated one
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_status' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'pending_approval', 'completed', 'failed', 'rejected', 'cancelled'));
    END IF;
END $$;

-- 3. If it's an ENUM type (e.g., "payment_status_enum"), add the value
-- We wrap this in a DO block to avoid errors if the type doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'rejected';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'failed';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'cancelled';
    END IF;
END $$;

-- 4. Just in case, if it's a different enum name, check column type
DO $$
DECLARE
    enum_name text;
BEGIN
    SELECT udt_name INTO enum_name
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status';

    IF enum_name != 'text' AND enum_name != 'varchar' THEN
        -- It's likely an enum, try to add value dynamically if possible, 
        -- or just print a message that manual intervention might be needed if the above didn't work.
        -- But usually standard naming is used.
        NULL;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
