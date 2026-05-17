'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '@/lib/soundEngine';

// Random character set matching soulextract's transform scheme
// Includes lots of spaces for a "flicker" effect
const RANDOM_CHARS = '$#%&!()=/*-_. abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function getRandomChar(): string {
  return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
}

function getRandomString(length: number): string {
  return Array.from({ length }, () => getRandomChar()).join('');
}

interface TypingTextProps {
  /** The text to reveal with the typing animation */
  text: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Callback fired when animation completes */
  onComplete?: () => void;
  /** Whether to play typing sound (default: true) */
  soundEnabled?: boolean;
  /** Speed in ms per character (default: 55ms) */
  charSpeed?: number;
}

/**
 * TypingText — implements the soulextract.com "transform" typing animation.
 *
 * Characters start as RANDOM GIBBERISH, then resolve to actual text
 * character by character using requestAnimationFrame.
 *
 * Plays a brief "tick" sound for each character revealed.
 */
export default function TypingText({
  text,
  className,
  style,
  delay = 0,
  onComplete,
  soundEnabled = true,
  charSpeed = 55,
}: TypingTextProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Start the animation after delay
  useEffect(() => {
    if (!text) return;

    const delayTimer = setTimeout(() => {
      setStarted(true);
      setIsAnimating(true);
      countRef.current = 0;
      setRevealedCount(0);

      // Reveal one character at a time with a brief tick per letter
      intervalRef.current = setInterval(() => {
        countRef.current += 1;

        // Play a brief click sound for EVERY letter revealed (1:1 mapping)
        if (soundEnabled) {
          soundEngine.playTypeClick();
        }

        if (countRef.current >= text.length) {
          // Done — reveal all and stop
          setRevealedCount(text.length);
          setIsAnimating(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onCompleteRef.current?.();
          return;
        }

        setRevealedCount(countRef.current);
      }, charSpeed);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, delay, soundEnabled, charSpeed]);

  // Build display text: revealed real chars + random gibberish for the rest
  const displayText = started
    ? text.substring(0, revealedCount) + getRandomString(Math.max(0, text.length - revealedCount))
    : text;

  // When animation finishes, show clean text
  const finalText = !isAnimating && started ? text : displayText;

  if (!text) {
    return <span className={className} style={style} />;
  }

  return (
    <span className={className} style={style}>
      {finalText}
    </span>
  );
}
