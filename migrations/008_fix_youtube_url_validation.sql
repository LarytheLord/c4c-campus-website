-- Migration: Fix YouTube URL validation to accept more common formats
-- Date: 2026-01-18
-- Description: The previous validation was too strict and rejected valid YouTube URLs
--              with extra query parameters (like &t=10s, &list=..., etc.)

-- Drop existing constraint
ALTER TABLE lessons
DROP CONSTRAINT IF EXISTS valid_youtube_url;

-- Add improved CHECK constraint to validate YouTube URLs
-- Accepts:
--   - NULL (no video)
--   - https://www.youtube.com/watch?v=XXXXXXXXXXX (with optional extra params)
--   - https://youtube.com/watch?v=XXXXXXXXXXX (without www)
--   - https://youtu.be/XXXXXXXXXXX (short format)
--   - https://www.youtube.com/embed/XXXXXXXXXXX (embed format)
--   - https://youtube.com/shorts/XXXXXXXXXXX (shorts format)
--   - https://www.youtube.com/v/XXXXXXXXXXX (old format)

ALTER TABLE lessons
ADD CONSTRAINT valid_youtube_url 
CHECK (
    youtube_url IS NULL 
    OR youtube_url = ''
    OR youtube_url ~* '^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_\-]+'
);

COMMENT ON CONSTRAINT valid_youtube_url ON lessons IS 
    'Validates YouTube URLs to prevent malicious URL injection while accepting common formats';
