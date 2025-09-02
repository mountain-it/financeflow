-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true);

-- Set up storage policies for user uploads
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'avatars'
);

CREATE POLICY "Users can view their own avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'avatars'
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'avatars'
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'avatars'
);

-- Add avatar_url column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;