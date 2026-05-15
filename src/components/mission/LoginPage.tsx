'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StarfieldBackground } from './StarfieldBackground';

const STATUS_MESSAGES = [
  'Awaiting commander credentials...',
  'System ready for authentication',
  'Secure channel established',
];

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusVisible, setStatusVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [typingPhase, setTypingPhase] = useState(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const login = useAppStore((s) => s.login);
  const setLoading = useAppStore((s) => s.setLoading);

  // Cycle through status messages with fade in/out
  useEffect(() => {
    const cycleDuration = 3000;
    const fadeTime = 500;

    const interval = setInterval(() => {
      setStatusVisible(false);
      setTimeout(() => {
        setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        setStatusVisible(true);
      }, fadeTime);
    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  // Typing animation for messages
  const typeMessage = useCallback((message: string, onDone?: () => void) => {
    let i = 0;
    setTypingText('');

    const typeChar = () => {
      if (i < message.length) {
        setTypingText(message.slice(0, i + 1));
        soundEngine.type();
        i++;
        typingTimeoutRef.current = setTimeout(typeChar, 50 + Math.random() * 30);
      } else {
        onDone?.();
      }
    };

    typeChar();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!username.trim() || isSubmitting) return;

      soundEngine.click();
      setIsSubmitting(true);

      // Phase 1: "Accessing Mission Control..."
      typeMessage('Accessing Mission Control...', () => {
        setTimeout(() => {
          // Phase 2: "Preparing launch systems..."
          setTypingPhase(1);
          typeMessage('Preparing launch systems...', () => {
            setTimeout(() => {
              login(username.trim());
              setLoading('dashboard');
            }, 600);
          });
        }, 500);
      });
    },
    [username, isSubmitting, login, setLoading, typeMessage]
  );

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <StarfieldBackground speed={0.5} density={200} />

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1,
        }}
      />

      {/* Main login panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Holographic border glow wrapper */}
        <div
          className="rounded-2xl p-[2px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,255,255,0.6), rgba(168,85,247,0.4), rgba(0,255,255,0.3), rgba(168,85,247,0.5))',
            boxShadow:
              '0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(0,255,255,0.1), 0 0 100px rgba(168,85,247,0.1), inset 0 0 30px rgba(0,255,255,0.05)',
          }}
        >
          {/* Glassmorphism panel */}
          <div
            className="rounded-2xl p-8 backdrop-blur-xl"
            style={{
              background: 'rgba(10, 10, 30, 0.75)',
              border: '1px solid rgba(0, 255, 255, 0.15)',
            }}
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-widest mb-3"
                style={{
                  color: '#00ffff',
                  textShadow:
                    '0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(0,255,255,0.3), 0 0 80px rgba(0,255,255,0.1)',
                }}
              >
                MATHEMATICAL
                <br />
                MISSION CONTROL
              </h1>
              <p
                className="text-sm tracking-wider"
                style={{ color: 'rgba(168, 85, 247, 0.9)' }}
              >
                Commander authentication required
              </p>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-6 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,255,255,0.5), rgba(168,85,247,0.5), transparent)',
              }}
            />

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Commander ID input */}
              <div className="space-y-2">
                <label
                  htmlFor="commander-id"
                  className="block text-xs font-medium tracking-wider uppercase"
                  style={{ color: 'rgba(0, 255, 255, 0.7)' }}
                >
                  Commander ID
                </label>
                <Input
                  id="commander-id"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    soundEngine.type();
                  }}
                  placeholder="Enter your commander ID"
                  disabled={isSubmitting}
                  className="h-11 rounded-lg border bg-transparent text-white placeholder:text-gray-500"
                  style={{
                    borderColor: 'rgba(0, 255, 255, 0.3)',
                    backgroundColor: 'rgba(0, 10, 30, 0.5)',
                  }}
                  autoComplete="username"
                />
              </div>

              {/* Access Code input */}
              <div className="space-y-2">
                <label
                  htmlFor="access-code"
                  className="block text-xs font-medium tracking-wider uppercase"
                  style={{ color: 'rgba(0, 255, 255, 0.7)' }}
                >
                  Access Code
                </label>
                <Input
                  id="access-code"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    soundEngine.type();
                  }}
                  placeholder="Enter your access code"
                  disabled={isSubmitting}
                  className="h-11 rounded-lg border bg-transparent text-white placeholder:text-gray-500"
                  style={{
                    borderColor: 'rgba(0, 255, 255, 0.3)',
                    backgroundColor: 'rgba(0, 10, 30, 0.5)',
                  }}
                  autoComplete="current-password"
                />
              </div>

              {/* Submit button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting || !username.trim()}
                  className="w-full h-12 rounded-lg text-sm font-bold tracking-widest uppercase border-0"
                  style={{
                    background: isSubmitting
                      ? 'rgba(168, 85, 247, 0.3)'
                      : 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(168,85,247,0.2))',
                    color: '#00ffff',
                    boxShadow: isSubmitting
                      ? '0 0 15px rgba(168,85,247,0.3)'
                      : '0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(0,255,255,0.1), inset 0 0 20px rgba(0,255,255,0.05)',
                    border: '1px solid rgba(0, 255, 255, 0.4)',
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                      />
                      AUTHENTICATING
                    </span>
                  ) : (
                    'INITIATE MISSION'
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Status / Typing text area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-6 h-8 flex items-center justify-center"
            >
              {isSubmitting ? (
                <motion.p
                  key={`typing-${typingPhase}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs tracking-wider font-mono"
                  style={{ color: 'rgba(0, 255, 255, 0.8)' }}
                >
                  <span className="mr-1" style={{ color: 'rgba(168, 85, 247, 0.8)' }}>
                    {'>'}
                  </span>
                  {typingText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block ml-0.5"
                  >
                    _
                  </motion.span>
                </motion.p>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: statusVisible ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs tracking-wider font-mono"
                    style={{ color: 'rgba(168, 85, 247, 0.6)' }}
                  >
                    <span className="mr-1" style={{ color: 'rgba(0, 255, 255, 0.5)' }}>
                      {'>'}
                    </span>
                    {STATUS_MESSAGES[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Decorative bottom line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,255,255,0.3), rgba(168,85,247,0.3), transparent)',
              }}
            />

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
          </div>
        </div>

        {/* Ambient glow beneath panel */}
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,255,255,0.15), rgba(168,85,247,0.08), transparent)',
          }}
        />
      </motion.div>
    </div>
  );
}
