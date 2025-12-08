-- Events policies
CREATE POLICY "Organizers can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events"
ON events FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
ON events FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id);

-- Seats policies
-- Organizers need to manage seats for their events
CREATE POLICY "Organizers can insert seats for their events"
ON seats FOR INSERT
TO authenticated
WITH CHECK (
    event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
);

CREATE POLICY "Organizers can update seats for their events"
ON seats FOR UPDATE
TO authenticated
USING (
    event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
)
WITH CHECK (
    event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
);

CREATE POLICY "Organizers can delete seats for their events"
ON seats FOR DELETE
TO authenticated
USING (
    event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
    )
);

-- Notify to reload schema
NOTIFY pgrst, 'reload schema';
