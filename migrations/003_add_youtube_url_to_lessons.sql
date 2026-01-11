-- Migration: Add youtube_url column to lessons table
-- This column stores YouTube video URLs for lessons
-- Required for the lesson creation feature in /courses/[slug].astro

-- Add the youtube_url column if it doesn't exist
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add a comment to document the column's purpose
COMMENT ON COLUMN lessons.youtube_url IS 'YouTube video URL for the lesson (full URL like https://youtube.com/watch?v=...)';

-- SECURITY: Add CHECK constraint to validate YouTube URLs
-- This prevents injection of malicious URLs (javascript:, phishing links, etc.)
ALTER TABLE lessons
DROP CONSTRAINT IF EXISTS valid_youtube_url;

ALTER TABLE lessons
ADD CONSTRAINT valid_youtube_url 
CHECK (
    youtube_url IS NULL 
    OR youtube_url ~* '^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}'
);

-- Note: The video_url column is used for uploaded/hosted videos,
-- while youtube_url is specifically for YouTube links.
-- This separation allows different handling for each video type.
