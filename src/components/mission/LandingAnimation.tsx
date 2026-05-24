'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/soundEngine';
import { useAppStore } from '@/store/appStore';

// ─── Mission Color Types & Data ────────────────────────────────────────

interface MissionSurfaceColors {
  dark: string;
  mid: string;
  light: string;
  border: string;
  glowPulseA: string;
  glowPulseB: string;
  padBorder: string;
  padLight: string;
  padLightGlow: string;
  dust: string;
  flash: string;
  textShadow: string;
  textColor: string;
  ringBorder: string;
  horizonGradient: string;
  surfaceLine: string;
  craterBorder: string;
  craterBg: string;
  /** Accent color for HUD text and highlights */
  accent: string;
  /** Accent color for retro burn flames */
  flameAccent: string;
  /** Atmosphere ring color */
  atmosphereBorder: string;
  /** Grid/scan-line tint */
  gridTint: string;
  /** Pod dome gradient */
  podDomeA: string;
  podDomeB: string;
  /** Beacon light color */
  beaconColor: string;
  /** Antenna tip color */
  antennaTip: string;
  /** Solar panel color */
  solarFill: string;
  solarBorder: string;
  /** Planet label text */
  planetLabel: string;
  /** Phase label text */
  phaseLabelColor: string;
}

interface MissionColorInfo {
  glow: string;
  hex: string;
  surface: MissionSurfaceColors;
}

const MISSION_COLORS: Record<string, MissionColorInfo> = {
  collatz: {
    glow: 'rgba(0,210,255,0.6)',
    hex: '#00D2FF',
    surface: {
      dark: '#001828', mid: '#002840', light: '#003858',
      border: 'rgba(0,180,255,0.35)',
      glowPulseA: '0 0 60px rgba(0,180,255,0.35), 0 0 120px rgba(0,200,255,0.18)',
      glowPulseB: '0 0 100px rgba(0,200,255,0.5), 0 0 180px rgba(0,210,255,0.28)',
      padBorder: 'rgba(0,200,255,0.7)', padLight: '#00D2FF',
      padLightGlow: '0 0 10px rgba(0,210,255,0.9)', dust: 'rgba(0,180,255,0.13)',
      flash: '#00D2FF', textShadow: '0 0 30px rgba(0,210,255,1), 0 0 60px rgba(0,180,255,0.8)',
      textColor: '#00D2FF', ringBorder: 'rgba(0,210,255,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(0,60,100,0.15), transparent)',
      surfaceLine: 'rgba(0,200,255,0.5)', craterBorder: 'rgba(0,160,255,0.2)', craterBg: 'rgba(0,20,40,0.4)',
      accent: '#00D2FF', flameAccent: '#00D2FF',
      atmosphereBorder: 'rgba(0,180,255,0.3)', gridTint: 'rgba(0,220,255,0.06)',
      podDomeA: 'rgba(0,100,200,0.8)', podDomeB: 'rgba(0,30,60,0.9)',
      beaconColor: '#00D2FF', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(0,200,120,0.25)', solarBorder: 'rgba(0,200,120,0.4)',
      planetLabel: 'rgba(0,180,255,0.55)', phaseLabelColor: 'rgba(0,255,180,0.8)',
    },
  },
  fibonacci: {
    glow: 'rgba(0,255,159,0.6)',
    hex: '#00FF9F',
    surface: {
      dark: '#001a0f', mid: '#002a18', light: '#003520',
      border: 'rgba(0,200,120,0.35)',
      glowPulseA: '0 0 60px rgba(0,200,120,0.35), 0 0 120px rgba(0,220,140,0.18)',
      glowPulseB: '0 0 100px rgba(0,220,140,0.5), 0 0 180px rgba(0,255,159,0.28)',
      padBorder: 'rgba(0,220,140,0.7)', padLight: '#00FF9F',
      padLightGlow: '0 0 10px rgba(0,255,159,0.9)', dust: 'rgba(0,200,120,0.13)',
      flash: '#00FF9F', textShadow: '0 0 30px rgba(0,255,159,1), 0 0 60px rgba(0,220,140,0.8)',
      textColor: '#00FF9F', ringBorder: 'rgba(0,255,159,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(0,80,40,0.15), transparent)',
      surfaceLine: 'rgba(0,220,140,0.5)', craterBorder: 'rgba(0,180,100,0.2)', craterBg: 'rgba(0,25,15,0.4)',
      accent: '#00FF9F', flameAccent: '#00FF9F',
      atmosphereBorder: 'rgba(0,200,120,0.3)', gridTint: 'rgba(0,255,159,0.06)',
      podDomeA: 'rgba(0,200,80,0.8)', podDomeB: 'rgba(0,40,20,0.9)',
      beaconColor: '#00FF9F', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(0,200,120,0.25)', solarBorder: 'rgba(0,200,120,0.4)',
      planetLabel: 'rgba(0,200,120,0.55)', phaseLabelColor: 'rgba(0,255,180,0.8)',
    },
  },
  tribonacci: {
    glow: 'rgba(255,80,180,0.6)',
    hex: '#FF50B4',
    surface: {
      dark: '#1a0020', mid: '#2a0030', light: '#350038',
      border: 'rgba(220,70,150,0.35)',
      glowPulseA: '0 0 60px rgba(220,70,150,0.35), 0 0 120px rgba(240,80,170,0.18)',
      glowPulseB: '0 0 100px rgba(240,80,170,0.5), 0 0 180px rgba(255,80,180,0.28)',
      padBorder: 'rgba(240,80,170,0.7)', padLight: '#FF50B4',
      padLightGlow: '0 0 10px rgba(255,80,180,0.9)', dust: 'rgba(220,70,150,0.13)',
      flash: '#FF50B4', textShadow: '0 0 30px rgba(255,80,180,1), 0 0 60px rgba(240,70,160,0.8)',
      textColor: '#FF50B4', ringBorder: 'rgba(255,80,180,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(80,0,50,0.15), transparent)',
      surfaceLine: 'rgba(240,80,170,0.5)', craterBorder: 'rgba(180,60,130,0.2)', craterBg: 'rgba(25,0,20,0.4)',
      accent: '#FF50B4', flameAccent: '#FF50B4',
      atmosphereBorder: 'rgba(220,70,150,0.3)', gridTint: 'rgba(255,80,180,0.06)',
      podDomeA: 'rgba(200,50,150,0.8)', podDomeB: 'rgba(40,0,40,0.9)',
      beaconColor: '#FF50B4', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(200,0,120,0.25)', solarBorder: 'rgba(200,0,120,0.4)',
      planetLabel: 'rgba(220,70,150,0.55)', phaseLabelColor: 'rgba(255,150,220,0.8)',
    },
  },
  lucas: {
    glow: 'rgba(255,140,0,0.6)',
    hex: '#FF8C00',
    surface: {
      dark: '#1a0e00', mid: '#2a1600', light: '#351c00',
      border: 'rgba(220,120,0,0.35)',
      glowPulseA: '0 0 60px rgba(220,120,0,0.35), 0 0 120px rgba(240,130,0,0.18)',
      glowPulseB: '0 0 100px rgba(240,130,0,0.5), 0 0 180px rgba(255,140,0,0.28)',
      padBorder: 'rgba(240,130,0,0.7)', padLight: '#FF8C00',
      padLightGlow: '0 0 10px rgba(255,140,0,0.9)', dust: 'rgba(220,120,0,0.13)',
      flash: '#FF8C00', textShadow: '0 0 30px rgba(255,140,0,1), 0 0 60px rgba(240,120,0,0.8)',
      textColor: '#FF8C00', ringBorder: 'rgba(255,140,0,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(80,40,0,0.15), transparent)',
      surfaceLine: 'rgba(240,130,0,0.5)', craterBorder: 'rgba(180,100,0,0.2)', craterBg: 'rgba(25,15,0,0.4)',
      accent: '#FF8C00', flameAccent: '#FF8C00',
      atmosphereBorder: 'rgba(220,120,0,0.3)', gridTint: 'rgba(255,140,0,0.06)',
      podDomeA: 'rgba(200,100,0,0.8)', podDomeB: 'rgba(40,20,0,0.9)',
      beaconColor: '#FF8C00', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(200,120,0,0.25)', solarBorder: 'rgba(200,120,0,0.4)',
      planetLabel: 'rgba(220,120,0,0.55)', phaseLabelColor: 'rgba(255,200,100,0.8)',
    },
  },
  euclidean: {
    glow: 'rgba(255,92,46,0.6)',
    hex: '#FF5C2E',
    surface: {
      dark: '#1a0c00', mid: '#2a1200', light: '#351800',
      border: 'rgba(220,80,40,0.35)',
      glowPulseA: '0 0 60px rgba(220,80,40,0.35), 0 0 120px rgba(240,90,45,0.18)',
      glowPulseB: '0 0 100px rgba(240,90,45,0.5), 0 0 180px rgba(255,92,46,0.28)',
      padBorder: 'rgba(240,90,45,0.7)', padLight: '#FF5C2E',
      padLightGlow: '0 0 10px rgba(255,92,46,0.9)', dust: 'rgba(220,80,40,0.13)',
      flash: '#FF5C2E', textShadow: '0 0 30px rgba(255,92,46,1), 0 0 60px rgba(240,80,40,0.8)',
      textColor: '#FF5C2E', ringBorder: 'rgba(255,92,46,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(80,25,10,0.15), transparent)',
      surfaceLine: 'rgba(240,90,45,0.5)', craterBorder: 'rgba(180,70,30,0.2)', craterBg: 'rgba(25,10,5,0.4)',
      accent: '#FF5C2E', flameAccent: '#FF5C2E',
      atmosphereBorder: 'rgba(220,80,40,0.3)', gridTint: 'rgba(255,92,46,0.06)',
      podDomeA: 'rgba(200,60,30,0.8)', podDomeB: 'rgba(40,10,5,0.9)',
      beaconColor: '#FF5C2E', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(200,80,30,0.25)', solarBorder: 'rgba(200,80,30,0.4)',
      planetLabel: 'rgba(220,80,40,0.55)', phaseLabelColor: 'rgba(255,160,100,0.8)',
    },
  },
  division: {
    glow: 'rgba(180,77,255,0.6)',
    hex: '#B44DFF',
    surface: {
      dark: '#10001a', mid: '#18002a', light: '#200035',
      border: 'rgba(150,60,220,0.35)',
      glowPulseA: '0 0 60px rgba(130,80,220,0.35), 0 0 120px rgba(100,220,160,0.18)',
      glowPulseB: '0 0 100px rgba(160,100,255,0.5), 0 0 180px rgba(80,200,140,0.28)',
      padBorder: 'rgba(170,70,240,0.7)', padLight: '#B44DFF',
      padLightGlow: '0 0 10px rgba(180,77,255,0.9)', dust: 'rgba(140,60,220,0.13)',
      flash: '#B44DFF', textShadow: '0 0 30px rgba(180,80,255,1), 0 0 60px rgba(120,60,200,0.8)',
      textColor: '#B44DFF', ringBorder: 'rgba(180,77,255,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(60,0,90,0.15), transparent)',
      surfaceLine: 'rgba(170,70,240,0.5)', craterBorder: 'rgba(130,55,200,0.2)', craterBg: 'rgba(18,0,28,0.4)',
      accent: '#B44DFF', flameAccent: '#B44DFF',
      atmosphereBorder: 'rgba(140,80,220,0.3)', gridTint: 'rgba(180,77,255,0.06)',
      podDomeA: 'rgba(100,50,200,0.8)', podDomeB: 'rgba(30,10,60,0.9)',
      beaconColor: '#B44DFF', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(100,0,200,0.25)', solarBorder: 'rgba(100,0,200,0.4)',
      planetLabel: 'rgba(160,80,255,0.55)', phaseLabelColor: 'rgba(200,150,255,0.8)',
    },
  },
  palindrome: {
    glow: 'rgba(255,215,0,0.6)',
    hex: '#FFD700',
    surface: {
      dark: '#1a1500', mid: '#2a2000', light: '#352b00',
      border: 'rgba(220,180,0,0.35)',
      glowPulseA: '0 0 60px rgba(220,180,0,0.35), 0 0 120px rgba(240,200,0,0.18)',
      glowPulseB: '0 0 100px rgba(240,200,0,0.5), 0 0 180px rgba(255,215,0,0.28)',
      padBorder: 'rgba(240,200,0,0.7)', padLight: '#FFD700',
      padLightGlow: '0 0 10px rgba(255,215,0,0.9)', dust: 'rgba(220,180,0,0.13)',
      flash: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,1), 0 0 60px rgba(240,200,0,0.8)',
      textColor: '#FFD700', ringBorder: 'rgba(255,215,0,0.8)',
      horizonGradient: 'linear-gradient(to top, rgba(80,60,0,0.15), transparent)',
      surfaceLine: 'rgba(240,200,0,0.5)', craterBorder: 'rgba(180,150,0,0.2)', craterBg: 'rgba(25,20,0,0.4)',
      accent: '#FFD700', flameAccent: '#FFD700',
      atmosphereBorder: 'rgba(220,180,0,0.3)', gridTint: 'rgba(255,215,0,0.06)',
      podDomeA: 'rgba(200,160,0,0.8)', podDomeB: 'rgba(40,30,0,0.9)',
      beaconColor: '#FFD700', antennaTip: 'rgba(0,255,200,0.8)',
      solarFill: 'rgba(200,160,0,0.25)', solarBorder: 'rgba(200,160,0,0.4)',
      planetLabel: 'rgba(220,180,0,0.55)', phaseLabelColor: 'rgba(255,230,100,0.8)',
    },
  },
};

// Planet image mapping for each mission
const PLANET_IMAGES: Record<string, string> = {
  collatz: '/planets/planet-collatz.png',
  fibonacci: '/planets/planet-fibonacci.png',
  tribonacci: '/planets/planet-tribonacci.png',
  lucas: '/planets/planet-lucas.png',
  euclidean: '/planets/planet-euclidean.png',
  division: '/planets/planet-division.png',
  palindrome: '/planets/planet-palindrome.png',
};

// Planet names for the HUD
const PLANET_NAMES: Record<string, string> = {
  collatz: 'CYANUS-IV · SECTOR C-7',
  fibonacci: 'VERIDIAN-III · SECTOR F-7',
  tribonacci: 'NOVAPRIME · SECTOR T-4',
  lucas: 'PULSARA · SECTOR L-9',
  euclidean: 'EMBER-X · SECTOR E-2',
  division: 'WARP-IX · SECTOR D-6',
  palindrome: 'AURELIA-VII · SECTOR P-3',
};

const DEFAULT_COLOR: MissionColorInfo = MISSION_COLORS.division;

function getMissionColor(missionId: string | null): MissionColorInfo {
  if (!missionId) return DEFAULT_COLOR;
  return MISSION_COLORS[missionId] ?? DEFAULT_COLOR;
}

// ─── Star Field ─────────────────────────────────────────────────────────
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 75,
        size: Math.random() < 0.1 ? 2.5 : Math.random() < 0.28 ? 1.5 : 1,
        duration: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `la-star-twinkle ${star.duration}s linear ${star.delay}s infinite`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ─── Landing Pod SVG ───────────────────────────────────────────────────
function LandingPod({ surfaceColors }: { surfaceColors: MissionSurfaceColors }) {
  return (
    <div className="flex flex-col items-center" style={{ position: 'relative' }}>
      {/* Pod body */}
      <div
        style={{
          width: 90, height: 16,
          background: 'linear-gradient(to bottom, #1a0a30, #0d0020)',
          border: `1px solid ${surfaceColors.padBorder}`,
          borderRadius: 3, position: 'relative',
          boxShadow: `0 0 14px ${surfaceColors.glowPulseA.split(',')[0]?.replace('0 0 60px', '0 0 14px') || 'rgba(140,60,255,0.4)'}, 0 0 4px rgba(0,255,120,0.2)`,
        }}
      >
        {/* Dome */}
        <div style={{
          position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
          width: 24, height: 13, borderRadius: '50% 50% 0 0',
          background: `linear-gradient(135deg, ${surfaceColors.podDomeA}, ${surfaceColors.podDomeB})`,
          border: `1px solid ${surfaceColors.padBorder}`, borderBottom: 'none',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: 4, width: 8, height: 5,
            borderRadius: '50%', background: 'rgba(200,160,255,0.35)',
          }} />
        </div>
        {/* Lights */}
        <div style={{
          position: 'absolute', top: -16, width: 5, height: 5, borderRadius: '50%',
          background: surfaceColors.beaconColor, left: 10,
          animation: 'la-pod-beacon 1.2s ease-in-out infinite',
          boxShadow: `0 0 10px ${surfaceColors.beaconColor}`,
        }} />
        <div style={{
          position: 'absolute', top: -16, width: 5, height: 5, borderRadius: '50%',
          background: surfaceColors.beaconColor, right: 10,
          animation: 'la-pod-beacon 1.2s ease-in-out infinite 0.6s',
          boxShadow: `0 0 10px ${surfaceColors.beaconColor}`,
        }} />
        {/* Antenna */}
        <div style={{
          position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
          width: 1.5, height: 9, background: surfaceColors.padBorder,
        }}>
          <div style={{
            position: 'absolute', top: -3, left: -2, width: 5, height: 3,
            borderRadius: '50%', background: surfaceColors.antennaTip,
          }} />
        </div>
        {/* Solar panels */}
        <div style={{
          position: 'absolute', top: 3, width: 14, height: 6,
          background: surfaceColors.solarFill, border: `1px solid ${surfaceColors.solarBorder}`, borderRadius: 1,
          left: -16,
        }} />
        <div style={{
          position: 'absolute', top: 3, width: 14, height: 6,
          background: surfaceColors.solarFill, border: `1px solid ${surfaceColors.solarBorder}`, borderRadius: 1,
          right: -16,
        }} />
        {/* Legs */}
        <div style={{ position: 'absolute', bottom: 0, left: 12, width: 2, height: 12, background: surfaceColors.padBorder, transform: 'rotate(-18deg)', transformOrigin: 'top center' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 12, width: 2, height: 12, background: surfaceColors.padBorder, transform: 'rotate(18deg)', transformOrigin: 'top center' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 30, width: 2, height: 12, background: surfaceColors.padBorder, transform: 'rotate(-8deg)', transformOrigin: 'top center' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 30, width: 2, height: 12, background: surfaceColors.padBorder, transform: 'rotate(8deg)', transformOrigin: 'top center' }} />
        {/* Feet */}
        <div style={{ position: 'absolute', bottom: -3, left: 5, width: 10, height: 2, background: `${surfaceColors.padBorder}`, borderRadius: 1, opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -3, right: 5, width: 10, height: 2, background: `${surfaceColors.padBorder}`, borderRadius: 1, opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -3, left: 24, width: 10, height: 2, background: `${surfaceColors.padBorder}`, borderRadius: 1, opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -3, right: 24, width: 10, height: 2, background: `${surfaceColors.padBorder}`, borderRadius: 1, opacity: 0.5 }} />
        {/* Center mark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 20, height: 6, background: `${surfaceColors.accent}20`,
          border: `1px solid ${surfaceColors.accent}60`, borderRadius: 1,
        }} />
      </div>

    </div>
  );
}

// ─── Rocket SVG (landing config with retro burn) ────────────────────────
function LandingRocketSVG({ missionColor }: { missionColor: MissionColorInfo }) {
  const hex = missionColor.hex;
  const accentColor = hex;
  const strokeColor = hex;
  const finStroke = `${hex}B3`;
  const legStroke = `${hex}B3`;

  // Derive body tint from the mission accent color
  // We mix a dark base with the mission color to tint the hull
  const bodyDark = `${hex}18`;   // very subtle tint at edges
  const bodyMid = `${hex}30`;    // slightly more visible tint at center
  const bodyLight = `${hex}25`;  // mid-tone
  const noseDark = `${hex}10`;
  const noseMid = `${hex}20`;
  const finFill = `${hex}12`;

  return (
    <svg className="rocket" viewBox="-10 -5 72 230" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 54, position: 'relative', filter: `drop-shadow(0 0 14px ${missionColor.glow})` }}
    >
      <defs>
        <linearGradient id="bodyGradLand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={bodyDark} />
          <stop offset="30%" stopColor={bodyMid} />
          <stop offset="60%" stopColor={bodyLight} />
          <stop offset="100%" stopColor={bodyDark} />
        </linearGradient>
        <linearGradient id="noseGradLand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={noseDark} />
          <stop offset="50%" stopColor={noseMid} />
          <stop offset="100%" stopColor={noseDark} />
        </linearGradient>
        <linearGradient id="accentGradLand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={`${accentColor}99`} />
        </linearGradient>
        <linearGradient id="tealAccent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={`${accentColor}AA`} />
        </linearGradient>
        <radialGradient id="flameOuterLand" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor={accentColor} stopOpacity="0.95" />
          <stop offset="60%" stopColor={`${accentColor}88`} stopOpacity="0.7" />
          <stop offset="100%" stopColor={`${accentColor}44`} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameCoreLand" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="50%" stopColor={`${accentColor}CC`} stopOpacity="0.9" />
          <stop offset="100%" stopColor={`${accentColor}66`} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Nose tip */}
      <circle cx="26" cy="0" r="1.5" fill={accentColor} opacity="0.9" />
      <path d="M26,0 L26,4" stroke={accentColor} strokeWidth="0.8" opacity="0.8" />
      {/* Nose cone */}
      <polygon points="26,4 18,32 34,32" fill="url(#noseGradLand)" stroke={strokeColor} strokeWidth="0.5" />
      {/* Body */}
      <rect x="14" y="32" width="24" height="90" rx="2" fill="url(#bodyGradLand)" stroke={strokeColor} strokeWidth="0.5" />
      <rect x="14" y="40" width="24" height="2" fill="url(#accentGradLand)" opacity="0.8" />
      <rect x="14" y="90" width="24" height="2" fill="url(#accentGradLand)" opacity="0.7" />
      <rect x="14" y="110" width="24" height="2" fill="url(#tealAccent)" opacity="0.5" />
      {/* Window */}
      <rect x="21" y="50" width="10" height="28" rx="1" fill="#050010" stroke={strokeColor} strokeWidth="0.4" opacity="0.9" />
      <circle cx="26" cy="58" r="3" fill="#000" stroke={accentColor} strokeWidth="0.5" />
      <circle cx="26" cy="58" r="1.5" fill={accentColor} opacity="0.6" />
      <line x1="21" y1="64" x2="31" y2="64" stroke={strokeColor} strokeWidth="0.3" opacity="0.5" />
      <line x1="21" y1="68" x2="31" y2="68" stroke={strokeColor} strokeWidth="0.3" opacity="0.5" />
      <line x1="21" y1="72" x2="31" y2="72" stroke={strokeColor} strokeWidth="0.3" opacity="0.5" />
      {/* Status lights */}
      <rect x="22" y="84" width="3" height="3" rx="0.5" fill={accentColor} opacity="0.5" />
      <rect x="27" y="84" width="3" height="3" rx="0.5" fill="#ff4400" opacity="0.5" />
      {/* Label */}
      <rect x="22" y="94" width="8" height="6" rx="1" fill="#050010" stroke={strokeColor} strokeWidth="0.4" />
      <text x="26" y="99.5" textAnchor="middle" fontSize="3.5" fill={accentColor} opacity="0.7" fontFamily="Share Tech Mono, monospace">ARC7</text>
      {/* Fins */}
      <polygon points="14,108 4,138 14,136" fill={finFill} stroke={finStroke} strokeWidth="0.5" />
      <polygon points="38,108 48,138 38,136" fill={finFill} stroke={finStroke} strokeWidth="0.5" />
      {/* Engine bell */}
      <rect x="12" y="120" width="28" height="22" rx="2" fill="#080015" stroke={strokeColor} strokeWidth="0.5" />
      <ellipse cx="26" cy="142" rx="10" ry="4" fill="#050010" stroke={strokeColor} strokeWidth="0.5" />
      <ellipse cx="26" cy="142" rx="6" ry="2.5" fill="#000" stroke={accentColor} strokeWidth="0.6" />
      <ellipse cx="26" cy="142" rx="3" ry="1.5" fill="#0a0020" />
      {/* Landing legs */}
      <line x1="14" y1="128" x2="-4" y2="158" stroke={legStroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="128" x2="56" y2="158" stroke={legStroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="-4" y1="158" x2="6" y2="158" stroke={legStroke} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="56" y1="158" x2="46" y2="158" stroke={legStroke} strokeWidth="1.2" strokeLinecap="round" />
      {/* Retro burn flames (pointing downward from engine) */}
      {/* Outer flame bloom */}
      <ellipse cx="26" cy="148" rx="13" ry="5" fill={accentColor} opacity="0.25" className="la-flame-flicker" />
      {/* Main flame cone */}
      <path d="M16,142 Q10,170 26,215 Q42,170 36,142 Z" fill="url(#flameOuterLand)" className="la-flame-flicker" />
      {/* Inner flame cone */}
      <path d="M20,142 Q18,165 26,200 Q34,165 32,142 Z" fill="url(#flameCoreLand)" className="la-flame-flicker" />
      {/* Hot core */}
      <path d="M23,142 Q22,158 26,182 Q30,158 29,142 Z" fill="#ffffff" opacity="0.9" className="la-flame-flicker" />
      {/* Nozzle glow ring */}
      <ellipse cx="26" cy="142" rx="10" ry="3.5" fill={accentColor} opacity="0.4" className="la-flame-flicker" />
    </svg>
  );
}

// ─── Dust Cloud Puffs ──────────────────────────────────────────────────
function DustCloud({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  const puffs = useMemo(() => [
    { left: -50, size: 65, delay: 0, dur: 1.3 },
    { left: 50, size: 55, delay: 0.15, dur: 1.1 },
    { left: -25, size: 75, delay: 0.3, dur: 1.4 },
    { left: 25, size: 60, delay: 0.1, dur: 1.2 },
    { left: -70, size: 45, delay: 0.4, dur: 1.0 },
    { left: 70, size: 50, delay: 0.25, dur: 1.15 },
  ], []);

  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 'calc(18vh - 40px)' }}>
      {puffs.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left, bottom: 0, marginLeft: -p.size / 2,
            background: surfaceColors.dust,
            animation: `la-dust-spread ${p.dur}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Landing Sparks ─────────────────────────────────────────────────────
function LandingSparks({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  const sparks = useMemo(() => {
    const colors = [surfaceColors.accent, '#9933ff', '#ff8800', '#ff4400', '#00ffcc', '#ffffff'];
    return Array.from({ length: 22 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 60;
      return {
        id: i,
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist * 0.5 + 20,
        left: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 0.4 + Math.random() * 0.5,
        delay: Math.random(),
      };
    });
  }, [surfaceColors]);

  if (!visible) return null;
  return (
    <div className="absolute left-1/2 pointer-events-none z-20" style={{ bottom: 'calc(18vh - 20px)' }}>
      {sparks.map((sp) => (
        <div
          key={sp.id}
          className="absolute w-[3px] h-[3px] rounded-full"
          style={{
            background: sp.color, left: sp.left, top: 0,
            animation: `la-spark ${sp.duration}s ease-out ${sp.delay}s infinite`,
            '--la-sx': `${sp.sx}px`, '--la-sy': `${sp.sy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Shockwave Ring ─────────────────────────────────────────────────────
function ShockwaveRing({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 'calc(18vh - 30px)' }}>
      <div
        className="w-[70px] h-[22px] rounded-[50%]"
        style={{
          border: `1px solid ${surfaceColors.ringBorder}`,
          animation: 'la-shockwave 0.9s ease-out infinite',
        }}
      />
    </div>
  );
}

// ─── Expanding Rings ────────────────────────────────────────────────────
function ExpandingRings({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 'calc(18vh - 38px)' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-[90px] h-[28px] rounded-[50%]"
          style={{
            border: `1px solid ${surfaceColors.ringBorder}`,
            left: -45, top: -14,
            animation: `la-ring-expand 1.2s ease-out ${i * 0.3}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Approach Ping ──────────────────────────────────────────────────────
function ApproachPing({ active, surfaceColors }: { active: boolean; surfaceColors: MissionSurfaceColors }) {
  if (!active) return null;
  return (
    <div
      className="absolute left-1/2 w-[160px] h-[40px] rounded-[50%] pointer-events-none z-10"
      style={{
        bottom: 'calc(18vh - 35px)', border: `1px solid ${surfaceColors.accent}66`,
        animation: 'la-approach-ping 1.2s ease-out infinite',
      }}
    />
  );
}

// ─── Touchdown Flash ────────────────────────────────────────────────────
function TouchdownFlash({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  if (!visible) return null;
  return (
    <div
      className="absolute inset-0 z-[100] pointer-events-none"
      style={{
        backgroundColor: surfaceColors.flash,
        animation: 'la-touchdown-flash 1.5s ease-out forwards',
      }}
    />
  );
}

// ─── TOUCHDOWN Text ─────────────────────────────────────────────────────
function TouchdownText({ visible, surfaceColors }: { visible: boolean; surfaceColors: MissionSurfaceColors }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.3, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <span style={{
            fontFamily: "var(--font-share-tech-mono), monospace",
            fontSize: '62px', fontWeight: 'bold',
            color: surfaceColors.textColor,
            textShadow: surfaceColors.textShadow,
            letterSpacing: '4px', lineHeight: 1,
          }}>
            TOUCHDOWN
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── HUD Left Panel ─────────────────────────────────────────────────────
function HUDLeft({ thrust, fuel, status, surfaceColors }: {
  thrust: number; fuel: number; status: string; surfaceColors: MissionSurfaceColors;
}) {
  const statusColor =
    status === 'LANDED' ? 'rgba(200,120,255,0.95)' :
    status === 'NEAR-SURFACE' ? 'rgba(255,200,0,0.9)' :
    status === 'DESCENDING' ? 'rgba(255,180,0,0.9)' :
    'rgba(0,255,200,0.95)';

  return (
    <div className="absolute top-5 left-5 z-30" style={{
      color: 'rgba(0,220,255,0.85)', fontSize: '11px', lineHeight: 1.8,
      fontFamily: "var(--font-share-tech-mono), monospace", textShadow: '0 0 6px rgba(0,220,255,0.8)',
    }}>
      <div style={{ color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>VEHICLE ID</div>
      <div style={{ color: surfaceColors.accent, fontWeight: 'bold' }}>ARC-7 NOVA</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>RETRO THRUST</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{thrust}%</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>STATUS</div>
      <div style={{ color: statusColor, fontWeight: 'bold' }}>{status}</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>FUEL</div>
      <div style={{ color: fuel < 10 ? 'rgba(255,77,0,0.9)' : fuel < 20 ? 'rgba(255,180,0,0.9)' : 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{fuel}%</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>STAGE</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>02 / 02</div>
    </div>
  );
}

// ─── HUD Right Panel ────────────────────────────────────────────────────
function HUDRight({ altitude, descentRate, accel, temp }: {
  altitude: number; descentRate: number; accel: number; temp: number;
}) {
  return (
    <div className="absolute top-5 right-5 z-30 text-right" style={{
      color: 'rgba(0,220,255,0.85)', fontSize: '11px', lineHeight: 1.8,
      fontFamily: "var(--font-share-tech-mono), monospace", textShadow: '0 0 6px rgba(0,220,255,0.8)',
    }}>
      <div style={{ color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>ALTITUDE</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{altitude} m</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>DESCENT RATE</div>
      <div style={{ color: descentRate < -100 ? 'rgba(255,77,0,0.9)' : descentRate < -30 ? 'rgba(255,200,87,0.9)' : 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{descentRate} m/s</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>ACCEL</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{accel.toFixed(1)} g</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>SURFACE TEMP</div>
      <div style={{ color: 'rgba(255,180,0,0.9)', fontWeight: 'bold' }}>{temp} °C</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>COMMS</div>
      <div style={{ color: 'rgba(0,255,130,0.9)', fontWeight: 'bold' }}>NOMINAL</div>
    </div>
  );
}

// ─── Data Stream ────────────────────────────────────────────────────────
function DataStream() {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 overflow-hidden text-center rounded-[3px] py-[2px]"
      style={{ border: '1px solid rgba(0,220,255,0.2)', width: 180, height: 30 }}
    >
      <div style={{
        fontFamily: "var(--font-share-tech-mono), monospace", fontSize: '10px',
        color: 'rgba(0,220,255,0.7)', lineHeight: 1.7,
        animation: 'la-data-scroll 4s linear infinite', whiteSpace: 'nowrap',
      }}>
        RETRO BURN: ACTIVE&nbsp;&nbsp;NAV: LOCK<br />
        LANDING RADAR: ARM&nbsp;&nbsp;LEGS: DEPLOY<br />
        TGT DESIGNATE: ALPHA&nbsp;&nbsp;POD: CLEAR<br />
        TRAJECTORY: NOMINAL<br />
        HAZARD DETECT: CLEAR<br />
        RETRO BURN: ACTIVE&nbsp;&nbsp;NAV: LOCK
      </div>
    </div>
  );
}

// ─── Altitude Bar ───────────────────────────────────────────────────────
function AltitudeBar({ landing }: { landing: boolean }) {
  return (
    <div className="absolute right-[22px] z-30 w-2 rounded-[2px] flex items-end overflow-hidden"
      style={{ border: '1px solid rgba(0,220,255,0.25)', bottom: 58, height: 140 }}
    >
      <div className="w-full" style={{
        background: 'linear-gradient(to top, #b060ff, #00aaff)',
        height: 140,
        animation: landing ? 'la-altitude-bar-drain 5s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
      }} />
    </div>
  );
}

// ─── Power Bar ──────────────────────────────────────────────────────────
function PowerBar({ landing }: { landing: boolean }) {
  return (
    <div className="absolute left-5 z-30" style={{ bottom: 18, width: 120 }}>
      <div style={{ fontSize: '9px', color: 'rgba(0,220,255,0.45)', letterSpacing: '1px', marginBottom: 3 }}>
        RETRO THRUST
      </div>
      <div className="h-[5px] rounded-[2px] overflow-hidden"
        style={{ background: 'rgba(0,220,255,0.1)', border: '1px solid rgba(0,220,255,0.2)' }}
      >
        <div className="h-full" style={{
          background: 'linear-gradient(90deg, #b060ff, #00aaff, #ff4400)',
          width: '100%',
          animation: landing ? 'la-power-bar-drain 5s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
        }} />
      </div>
    </div>
  );
}

// ─── Corner Brackets ────────────────────────────────────────────────────
function CornerBrackets() {
  const corners = [
    { cls: 'top-[10px] left-[10px] border-t border-l' },
    { cls: 'top-[10px] right-[10px] border-t border-r' },
    { cls: 'bottom-[10px] left-[10px] border-b border-l' },
    { cls: 'bottom-[10px] right-[10px] border-b border-r' },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <div key={i} className={`absolute w-3 h-3 z-30 ${c.cls}`}
          style={{ borderColor: 'rgba(0,220,255,0.4)' }}
        />
      ))}
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function LandingAnimation() {
  const { loadingMissionId, soundEnabled } = useAppStore();
  const setPage = useAppStore((s) => s.setPage);
  const selectMission = useAppStore((s) => s.selectMission);

  // Color system
  const missionColor = getMissionColor(loadingMissionId);
  const surfaceColors = missionColor.surface;

  // Fade-in state
  const [fadeIn, setFadeIn] = useState(false);

  // Animation state
  const [landing, setLanding] = useState(false);
  const [approachPingActive, setApproachPingActive] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showRings, setShowRings] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showTouchdownText, setShowTouchdownText] = useState(false);
  const [surfaceShake, setSurfaceShake] = useState(false);
  const [retroBurnOff, setRetroBurnOff] = useState(false);

  // HUD telemetry
  const [altitude, setAltitude] = useState(820);
  const [descentRate, setDescentRate] = useState(-148);
  const [thrust, setThrust] = useState(100);
  const [fuel, setFuel] = useState(28);
  const [landingAccel, setLandingAccel] = useState(-2.8);
  const [landingTemp, setLandingTemp] = useState(-62);
  const [statusText, setStatusText] = useState('DESCENDING');
  const [phaseLabel, setPhaseLabel] = useState('TERMINAL DESCENT PHASE');

  // Music ref
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmStarted = useRef(false);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  // Timers ref
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hudIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // ─── Background Music with fade-in/fade-out ───────────────────────
  const startLandingBGM = useCallback(() => {
    if (bgmStarted.current) return;
    bgmStarted.current = true;

    // Stop existing BGM from soundEngine
    soundEngine.stopBGM();

    const audio = new Audio('/audio/landing-bgm.mp3');
    audio.loop = true;
    audio.volume = 0; // Start silent for fade-in
    bgmRef.current = audio;

    audio.play().then(() => {
      // Fade in over 2 seconds
      const fadeInDuration = 2000;
      const targetVolume = 0.3 * soundEngine.getVolume();
      const steps = 40;
      const stepTime = fadeInDuration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        if (audio && !audio.paused) {
          audio.volume = Math.min(targetVolume, volumeStep * currentStep);
        }
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
        }
      }, stepTime);
    }).catch(() => {
      // Autoplay blocked - will retry on user interaction
    });
  }, []);

  const stopLandingBGM = useCallback(() => {
    if (!bgmRef.current) return;
    const audio = bgmRef.current;
    const fadeOutDuration = 1500;
    const steps = 30;
    const stepTime = fadeOutDuration / steps;
    const volumeStep = audio.volume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, audio.volume - volumeStep);
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
        bgmRef.current = null;
        bgmStarted.current = false;
      }
    }, stepTime);
  }, []);

  // ─── Fade in on mount ──────────────────────────────────────────────
  useEffect(() => {
    // Trigger fade-in after mount
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ─── Main descent & landing animation flow ────────────────────────
  useEffect(() => {
    // Start landing sequence after fade-in
    const startDelay = setTimeout(() => {
      // Play dedicated landing SFX (synced to animation timeline, not audio duration)
      if (soundEnabled) {
        const sfx = new Audio('/audio/landing-sfx.mp3');
        sfx.volume = 0.6 * soundEngine.getVolume();
        sfx.play().catch(() => {});
        sfxRef.current = sfx;
      }

      // Start landing BGM with fade-in
      startLandingBGM();

      // Begin descent animation
      setLanding(true);

      const missionStart = Date.now();
      const duration = 5000;

      // HUD telemetry interval
      hudIntervalRef.current = setInterval(() => {
        const t = (Date.now() - missionStart) / 1000;
        const pct = Math.min(1, t / (duration / 1000));

        setAltitude(Math.round(820 * (1 - pct)));
        setDescentRate(Math.round(-148 + pct * 148));
        setThrust(Math.round(100 - pct * 72));
        setFuel(Math.max(2, Math.round(28 - pct * 25)));
        setLandingAccel(-2.8 + pct * 2.8);
        setLandingTemp(Math.round(-62 + pct * 60));

        if (t > 1.5) {
          setPhaseLabel('POWERED DESCENT');
        }
        if (t > 3) {
          setPhaseLabel('FINAL APPROACH');
          setApproachPingActive(true);
        }
        if (t > 4) {
          setPhaseLabel('HOVER & ALIGN');
          setStatusText('NEAR-SURFACE');
        }
        if (t > 4.6) {
          setPhaseLabel('CONTACT IMMINENT');
        }
      }, 50);

      // Touchdown at 4.9s
      addTimer(() => {
        if (hudIntervalRef.current) {
          clearInterval(hudIntervalRef.current);
          hudIntervalRef.current = null;
        }

        // Touchdown effects
        setShowDust(true);
        setShowShockwave(true);
        setShowSparks(true);
        setShowRings(true);
        setSurfaceShake(true);
        setShowFlash(true);
        setShowTouchdownText(true);
        setApproachPingActive(false);

        // Update HUD
        setAltitude(0);
        setDescentRate(0);
        setThrust(0);
        setFuel(2);
        setLandingAccel(0);
        setLandingTemp(-58);
        setStatusText('LANDED');
        setPhaseLabel('TOUCHDOWN CONFIRMED');

        // Play hatch sound
        if (soundEnabled) soundEngine.playHatch();

        // Stop surface shake
        addTimer(() => setSurfaceShake(false), 400);

        // Kill retro burn
        addTimer(() => setRetroBurnOff(true), 800);

        // Hide effects
        addTimer(() => {
          setShowDust(false);
          setShowShockwave(false);
          setShowSparks(false);
          setShowRings(false);
        }, 800);

        // Hide touchdown text
        addTimer(() => setShowTouchdownText(false), 1200);

        // After 1.5 seconds landed, transition to mission page
        addTimer(() => {
          // Fade out BGM before transition
          stopLandingBGM();

          // Fade out and stop landing SFX
          if (sfxRef.current) {
            const sfx = sfxRef.current;
            const fadeSteps = 15;
            const fadeTime = 600;
            const stepTime = fadeTime / fadeSteps;
            const volStep = sfx.volume / fadeSteps;
            let step = 0;
            const fadeInterval = setInterval(() => {
              step++;
              sfx.volume = Math.max(0, sfx.volume - volStep);
              if (step >= fadeSteps) {
                clearInterval(fadeInterval);
                sfx.pause();
                sfx.currentTime = 0;
                sfxRef.current = null;
              }
            }, stepTime);
          }

          // Brief delay for fade-out, then transition
          setTimeout(() => {
            if (loadingMissionId) {
              selectMission(loadingMissionId);
              setPage('mission');
            }
          }, 600);
        }, 1500);
      }, 4900);
    }, 500); // 500ms delay for initial fade-in

    return () => {
      if (hudIntervalRef.current) {
        clearInterval(hudIntervalRef.current);
        hudIntervalRef.current = null;
      }
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, [addTimer, soundEnabled, loadingMissionId, selectMission, setPage, startLandingBGM, stopLandingBGM]);

  // Cleanup BGM and SFX on unmount
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
        bgmRef.current = null;
        bgmStarted.current = false;
      }
      if (sfxRef.current) {
        sfxRef.current.pause();
        sfxRef.current.currentTime = 0;
        sfxRef.current = null;
      }
    };
  }, []);

  // Planet name from mission
  const planetName = loadingMissionId ? (PLANET_NAMES[loadingMissionId] || 'UNKNOWN · SECTOR X-0') : 'UNKNOWN · SECTOR X-0';

  // Planet fallback gradient
  const planetFallback = loadingMissionId
    ? `radial-gradient(circle at 38% 35%, ${surfaceColors.light} 0%, ${surfaceColors.mid} 30%, ${surfaceColors.dark} 100%)`
    : 'radial-gradient(circle at 38% 35%, #5DCAA5 0%, #1D9E75 30%, #9061f9 55%, #7c3aed 70%, #3b1080 100%)';

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        background: '#000814',
        fontFamily: "var(--font-share-tech-mono), monospace",
        height: '100vh',
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.5s ease-in',
      }}
    >
      {/* ── All keyframe styles ── */}
      <style>{`
        @keyframes la-star-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.5)} }
        @keyframes la-grid-scroll { 0%{transform:translateY(0)} 100%{transform:translateY(80px)} }
        @keyframes la-scan-line { 0%{top:0%;opacity:0.6} 100%{top:100%;opacity:0} }
        @keyframes la-descent {
          0%   { transform: translateX(-50%) translateY(-800px) rotate(-5deg); }
          25%  { transform: translateX(-50%) translateY(-550px) rotate(-3deg); }
          50%  { transform: translateX(-50%) translateY(-280px) rotate(-1deg); }
          70%  { transform: translateX(-50%) translateY(-100px) rotate(0deg); }
          85%  { transform: translateX(-50%) translateY(-15px)  rotate(0deg); }
          95%  { transform: translateX(-50%) translateY(5px)    rotate(0deg); }
          97%  { transform: translateX(-50%) translateY(-2px)   rotate(0deg); }
          100% { transform: translateX(-50%) translateY(0px)    rotate(0deg); }
        }
        @keyframes la-flame-flicker {
          0%,100% { transform: scaleX(1) scaleY(1); opacity: 1; }
          25%     { transform: scaleX(1.08) scaleY(0.96); opacity: 0.92; }
          50%     { transform: scaleX(0.93) scaleY(1.06); opacity: 0.85; }
          75%     { transform: scaleX(1.05) scaleY(0.98); opacity: 0.95; }
        }
        @keyframes la-shockwave { 0%{transform:scale(0.5);opacity:0.9} 100%{transform:scale(3.5);opacity:0} }
        @keyframes la-dust-spread { 0%{transform:scale(0.2) translateY(0);opacity:0.8} 100%{transform:scale(4.5) translateY(-30px);opacity:0} }
        @keyframes la-spark { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--la-sx),var(--la-sy)) scale(0);opacity:0} }
        @keyframes la-ring-expand { 0%{transform:scale(1);opacity:0.9} 100%{transform:scale(2.5);opacity:0} }
        @keyframes la-altitude-bar-drain { 0%{height:140px} 100%{height:4px} }
        @keyframes la-power-bar-drain { 0%{width:100%} 100%{width:25%} }
        @keyframes la-data-scroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        @keyframes la-hud-blink { 0%,80%,100%{opacity:1} 90%{opacity:0.2} }
        @keyframes la-touchdown-flash { 0%{opacity:0} 5%{opacity:0.9} 40%{opacity:0.6} 100%{opacity:0} }
        @keyframes la-approach-ping { 0%{transform:translateX(-50%) scale(1);opacity:0.8} 100%{transform:translateX(-50%) scale(3);opacity:0} }
        @keyframes la-surface-shake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-3px,-1px)} 40%{transform:translate(3px,1px)} 60%{transform:translate(-2px,0)} 80%{transform:translate(2px,-1px)} }
        @keyframes la-pod-beacon { 0%,100%{opacity:1;box-shadow:0 0 10px rgba(0,255,128,0.9)} 50%{opacity:0.3;box-shadow:0 0 3px rgba(0,255,128,0.3)} }

        .la-flame-flicker { animation: la-flame-flicker 0.1s ease-in-out infinite; transform-origin: 26px 142px; }
      `}</style>

      {/* ── Corner brackets ── */}
      <CornerBrackets />

      {/* ── Touchdown flash ── */}
      <TouchdownFlash visible={showFlash} surfaceColors={surfaceColors} />

      {/* ── TOUCHDOWN text ── */}
      <TouchdownText visible={showTouchdownText} surfaceColors={surfaceColors} />

      {/* ── Star field ── */}
      <StarField />

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{
        backgroundImage: `linear-gradient(${surfaceColors.gridTint} 1px, transparent 1px), linear-gradient(90deg, ${surfaceColors.gridTint} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        animation: 'la-grid-scroll 2s linear infinite',
      }} />

      {/* ── Scan line ── */}
      <div className="absolute left-0 right-0 h-[2px] z-[6] pointer-events-none" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,220,255,0.3), transparent)',
        animation: 'la-scan-line 4s linear infinite',
      }} />

      {/* ── HUD Left ── */}
      <HUDLeft thrust={thrust} fuel={fuel} status={statusText} surfaceColors={surfaceColors} />

      {/* ── HUD Right ── */}
      <HUDRight altitude={altitude} descentRate={descentRate} accel={landingAccel} temp={landingTemp} />

      {/* ── Data stream ── */}
      <DataStream />

      {/* ── Altitude bar ── */}
      <AltitudeBar landing={landing} />

      {/* ── Power bar ── */}
      <PowerBar landing={landing} />

      {/* ── Planet globe — the actual planet image as the landing surface arc ── */}
      <div
        className="absolute z-[2]"
        style={{
          width: '200vh', height: '200vh', borderRadius: '50%', overflow: 'hidden',
          bottom: '-182vh', left: '50%', marginLeft: '-100vh',
          background: planetFallback,
          ...(surfaceShake ? { animation: 'la-surface-shake 0.4s ease-out' } : {}),
        }}
      >
        {loadingMissionId && PLANET_IMAGES[loadingMissionId] && (
          <img
            src={PLANET_IMAGES[loadingMissionId]}
            alt={`${loadingMissionId} planet surface`}
            style={{
              position: 'absolute',
              top: '-45%',
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.9,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Atmosphere ring */}
      <div
        className="absolute z-[3] pointer-events-none"
        style={{
          width: '200vh', height: '200vh', borderRadius: '50%',
          bottom: '-182vh', left: '50%', marginLeft: '-100vh',
          border: `2px solid ${surfaceColors.atmosphereBorder}`,
          boxShadow: `0 0 30px ${surfaceColors.atmosphereBorder}, inset 0 0 60px ${surfaceColors.atmosphereBorder}`,
        }}
      />

      {/* Surface horizon line */}
      <div
        className="absolute z-[4] pointer-events-none"
        style={{
          left: '5%', right: '5%', height: '1px',
          bottom: '18vh',
          background: `linear-gradient(90deg, transparent, ${surfaceColors.surfaceLine}, transparent)`,
          boxShadow: `0 0 8px ${surfaceColors.surfaceLine}`,
        }}
      />

      {/* ── Landing pod sitting on planet surface (after touchdown) ── */}
      <div className="absolute z-[8]" style={{ bottom: 'calc(18vh - 8px)', left: '50%', transform: 'translateX(-50%)' }}>
        <LandingPod surfaceColors={surfaceColors} />
      </div>

      {/* ── Approach ping ── */}
      <ApproachPing active={approachPingActive} surfaceColors={surfaceColors} />

      {/* ── Rocket wrapper (descent animation) ── */}
      <div
        className="absolute z-[10] flex flex-col items-center"
        style={{
          bottom: 'calc(18vh - 55px)', left: '50%',
          transform: 'translateX(-50%) translateY(-800px) rotate(-5deg)',
          animation: landing ? 'la-descent 5s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
        }}
      >
        {/* Rocket (flames go away after retroBurnOff) */}
        {!retroBurnOff ? (
          <LandingRocketSVG missionColor={missionColor} />
        ) : (
          <LandingRocketSVG missionColor={missionColor} />
        )}
      </div>

      {/* ── Landing effects ── */}
      <DustCloud visible={showDust} surfaceColors={surfaceColors} />
      <LandingSparks visible={showSparks} surfaceColors={surfaceColors} />
      <ShockwaveRing visible={showShockwave} surfaceColors={surfaceColors} />
      <ExpandingRings visible={showRings} surfaceColors={surfaceColors} />

      {/* ── Planet label ── */}
      <div className="absolute z-30" style={{
        bottom: 'calc(18vh - 140px)', left: '50%', transform: 'translateX(-50%)',
        fontSize: '8px', letterSpacing: '3px', color: surfaceColors.planetLabel, whiteSpace: 'nowrap',
        fontFamily: "var(--font-share-tech-mono), monospace",
      }}>
        {planetName}
      </div>


    </div>
  );
}
