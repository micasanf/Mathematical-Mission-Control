'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  drift: number;
}

interface StarfieldBackgroundProps {
  speed?: number;
  density?: number;
}

export function StarfieldBackground({ speed = 0.5, density = 200 }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaRef = useRef<NebulaCloud[]>([]);
  const timeRef = useRef<number>(0);

  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < density; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        speed: (Math.random() * 0.3 + 0.1) * speed,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, [density, speed]);

  const initNebulae = useCallback((width: number, height: number) => {
    const nebulae: NebulaCloud[] = [
      {
        x: width * 0.2,
        y: height * 0.3,
        radius: Math.max(200, width * 0.2),
        color: '123, 111, 255', // nebula purple
        opacity: 0.03,
        drift: 0.02,
      },
      {
        x: width * 0.75,
        y: height * 0.6,
        radius: Math.max(250, width * 0.25),
        color: '0, 206, 201', // primary turquoise
        opacity: 0.025,
        drift: -0.015,
      },
      {
        x: width * 0.5,
        y: height * 0.15,
        radius: Math.max(180, width * 0.15),
        color: '77, 168, 255', // ion blue
        opacity: 0.02,
        drift: 0.01,
      },
      {
        x: width * 0.85,
        y: height * 0.2,
        radius: Math.max(150, width * 0.12),
        color: '125, 249, 192', // reactor green
        opacity: 0.02,
        drift: -0.008,
      },
    ];
    nebulaRef.current = nebulae;
  }, []);

  const spawnShootingStar = useCallback((width: number, height: number) => {
    const angle = Math.random() * 0.5 + 0.3; // 0.3 to 0.8 radians (mostly diagonal)
    shootingStarsRef.current.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.3,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 6,
      angle,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 60 + 30,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      initNebulae(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !canvas) return;

      timeRef.current += 1;
      const time = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw nebula clouds
      for (const nebula of nebulaRef.current) {
        const offsetX = Math.sin(time * nebula.drift * 0.01) * 30;
        const offsetY = Math.cos(time * nebula.drift * 0.01) * 20;
        const grad = ctx.createRadialGradient(
          nebula.x + offsetX,
          nebula.y + offsetY,
          0,
          nebula.x + offsetX,
          nebula.y + offsetY,
          nebula.radius
        );
        grad.addColorStop(0, `rgba(${nebula.color}, ${nebula.opacity})`);
        grad.addColorStop(0.5, `rgba(${nebula.color}, ${nebula.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(${nebula.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw and update stars
      for (const star of starsRef.current) {
        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity * (0.6 + 0.4 * twinkle);

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Add subtle glow to larger stars
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${currentOpacity * 0.15})`;
          ctx.fill();
        }

        // Move star (parallax drift)
        star.y += star.speed;
        star.x += star.speed * 0.15;

        // Wrap around
        if (star.y > height + 5) {
          star.y = -5;
          star.x = Math.random() * width;
        }
        if (star.x > width + 5) {
          star.x = -5;
        }
      }

      // Spawn shooting stars occasionally
      if (Math.random() < 0.005 * speed) {
        spawnShootingStar(width, height);
      }

      // Draw and update shooting stars
      const activeShootingStars: ShootingStar[] = [];
      for (const ss of shootingStarsRef.current) {
        ss.life += 1;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        // Fade out as life progresses
        const lifeRatio = ss.life / ss.maxLife;
        ss.opacity = lifeRatio < 0.2 ? lifeRatio * 5 : Math.max(0, 1 - (lifeRatio - 0.2) / 0.8);

        if (ss.life < ss.maxLife && ss.opacity > 0) {
          // Draw shooting star trail
          const tailX = ss.x - Math.cos(ss.angle) * ss.length;
          const tailY = ss.y - Math.sin(ss.angle) * ss.length;

          const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
          grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
          grad.addColorStop(0.7, `rgba(200, 240, 255, ${ss.opacity * 0.5})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright head
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
          ctx.fill();

          // Glow around head
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 255, ${ss.opacity * 0.3})`;
          ctx.fill();

          activeShootingStars.push(ss);
        }
      }
      shootingStarsRef.current = activeShootingStars;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initStars, initNebulae, spawnShootingStar, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
