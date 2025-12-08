-- Enable RLS on events and seats (good practice)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view events and seats
CREATE POLICY "Public can view events"
ON events FOR SELECT
USING (true);

CREATE POLICY "Public can view seats"
ON seats FOR SELECT
USING (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';
