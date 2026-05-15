'use client';

import { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export default function KaTeXFormula({ formula, displayMode = true, className }: KaTeXFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      katex.render(formula, containerRef.current, {
        displayMode,
        throwOnError: true,
        strict: false,
        trust: true,
      });
      errorRef.current = false;
      containerRef.current.style.color = '';
    } catch {
      errorRef.current = true;
      if (containerRef.current) {
        containerRef.current.textContent = formula;
        containerRef.current.style.color = '#f87171';
      }
    }
  }, [formula, displayMode]);

  return (
    <div
      className={`relative rounded-xl border border-cyan-500/30 bg-white/5 backdrop-blur-md p-6 shadow-lg shadow-cyan-500/10 ${className ?? ''}`}
      style={{
        boxShadow: '0 0 20px rgba(34,211,238,0.08), 0 0 40px rgba(34,211,238,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Cyan glow border effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, transparent 50%, rgba(34,211,238,0.03) 100%)',
        }}
      />

      {/* Formula content */}
      <div
        ref={containerRef}
        className="relative z-10 text-center overflow-x-auto"
      />

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
        }}
      />
    </div>
  );
}
