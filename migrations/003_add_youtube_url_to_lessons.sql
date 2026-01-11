-- Migration: Add youtube_url column to lessons table
-- This column stores YouTube video URLs for lessons
-- Required for the lesson creation feature in /courses/[slug].astro

-- Add the youtube_url column if it doesn't exist
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add a comment to document the column's purpose
COMMENT ON COLUMN lessons.youtube_url IS 'YouTube video URL for the lesson (full URL like https://youtube.com/watch?v=...)';

-- Note: The video_url column is used for uploaded/hosted videos,
-- while youtube_url is specifically for YouTube links.
-- This separation allows different handling for each video type.
