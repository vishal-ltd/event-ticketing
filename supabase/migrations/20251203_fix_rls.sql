-- Enable RLS on tables if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Tickets policies
CREATE POLICY "Users can create their own tickets"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
ON tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins/organizers to view all (optional, but good for admin panel)
-- Assuming there is a way to distinguish admins, or we just rely on service role for admin actions.
-- But the admin panel uses the user's client.
-- So we might need policies for admins.
-- For now, let's focus on the user flow error.
