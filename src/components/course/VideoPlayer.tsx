/**
 * VideoPlayer Component - TDD Implementation
 * Reference: BOOTCAMP_ARCHITECTURE.md lines 418-453
 * Critical features: 10s auto-save, resume playback, completion marking
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Lesson } from '@/types';

interface VideoPlayerProps {
  lesson: Lesson;
  signedUrl: string;
  initialPosition: number;
  onProgress: (data: { lessonId: number; videoPosition: number; completed: boolean }) => void;
  onComplete: (data: { lessonId: number; videoPosition: number; completed: boolean }) => void;
}

export default function VideoPlayer({
  lesson,
  signedUrl,
  initialPosition,
  onProgress,
  onComplete
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial position when video loads
  useEffect(() => {
    if (videoRef.current && signedUrl) {
      // Clamp initial position to valid range [0, duration]
      const clampedPosition = Math.max(0, initialPosition);

      // Set video source
      videoRef.current.src = signedUrl;

      // Set initial position after video metadata loads
      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          const maxPosition = videoRef.current.duration || 0;
          videoRef.current.currentTime = Math.min(clampedPosition, maxPosition);
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      // Set currentTime immediately if duration is already known
      if (videoRef.current.duration) {
        const maxPosition = videoRef.current.duration;
        videoRef.current.currentTime = Math.min(clampedPosition, maxPosition);
      }

      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [signedUrl, initialPosition]);

  // Auto-save progress every 10 seconds while playing
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      intervalRef.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          const currentPosition = Math.floor(videoRef.current.currentTime);
          onProgress({
            lessonId: lesson.id,
            videoPosition: currentPosition,
            completed: false,
          });
        }
      }, 10000); // 10 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isPlaying, lesson.id, onProgress]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle video ended event
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      const finalPosition = Math.floor(video.currentTime);
      onComplete({
        lessonId: lesson.id,
        videoPosition: finalPosition,
        completed: true,
      });
      setIsPlaying(false);
    };

    const handleError = () => {
      setHasError(true);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [lesson.id, onComplete]);

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle missing signed URL
  if (!signedUrl) {
    return (
      <div className="video-player-error">
        <p>Video unavailable</p>
      </div>
    );
  }

  // Handle video load error
  if (hasError) {
    return (
      <div className="video-player-error">
        <p>Failed to load video</p>
      </div>
    );
  }

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        controls={false}
        playsInline
        className="video-element"
      />

      <div className="video-controls">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Play video"
            role="button"
          >
            Play
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause video"
            role="button"
          >
            Pause
          </button>
        )}
      </div>
    </div>
  );
}