-- Add ticket_code column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_code TEXT;

-- Make it unique (but allow nulls for now to avoid issues with existing rows if any)
CREATE UNIQUE INDEX IF NOT EXISTS tickets_ticket_code_idx ON tickets (ticket_code);

-- Optional: You might want to backfill existing tickets with a code if needed, 
-- but for now we'll just leave them null or handle them in application logic.
