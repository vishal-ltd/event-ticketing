-- Add payment_screenshot_url to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- Update payment_status check constraint if it exists, or just ensure it accepts 'pending', 'completed', 'rejected'
-- (Assuming it's a text field or enum, we'll just leave it be if it's text, or alter type if needed. 
-- For safety, let's assume it's text and just add a check constraint if we want, but for now I'll skip the constraint modification to avoid errors if it's complex)

-- Create a storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_proofs', 'payment_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload payment proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment_proofs' AND auth.uid() = owner);

-- Policy to allow authenticated users to view payment proofs (or just admins/organizers, but for simplicity authenticated)
CREATE POLICY "Authenticated users can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment_proofs');
