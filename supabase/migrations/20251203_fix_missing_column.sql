-- Add the missing column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- Reload the schema cache to ensure PostgREST picks up the change immediately
NOTIFY pgrst, 'reload schema';
