import { useEffect, useRef } from 'react';
import { theme } from 'antd';

type Particle = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  alpha: number;
  velocityX: number;
  velocityY: number;
};

type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

type Ripple = {
  x: number;
  y: number;
  start: number;
};

const PARTICLE_COUNT = 42;
const MAX_RADIUS = 120;
const MIN_RADIUS = 36;
const CONNECTION_DISTANCE = 280;
const POINTER_INFLUENCE_RADIUS = 240;
const POINTER_FORCE = 0.16;
const VELOCITY_DAMPING = 0.97;
const POINTER_CONNECTION_BOOST = 1.4;
const MAX_CONNECTIONS_PER_PARTICLE = 6;
const RIPPLE_LIFETIME = 1200;
const RIPPLE_MAX_RADIUS = 480;
const RIPPLE_STROKE_WIDTH = 2.5;

const hexToRgb = (hex?: string) => {
  if (!hex) return null;
  let parsed = hex.replace('#', '');
  if (parsed.length === 3) {
    parsed = parsed
      .split('')
      .map(ch => ch + ch)
      .join('');
  }
  if (parsed.length !== 6) return null;
  const bigint = Number.parseInt(parsed, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const createParticle = (width: number, height: number): Particle => {
  const radius = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius,
    hue: Math.random() * 30 - 15,
    alpha: Math.random() * 0.35 + 0.25,
    velocityX: (Math.random() - 0.5) * 0.16,
    velocityY: (Math.random() - 0.5) * 0.16,
  };
};

interface AuthBackgroundCanvasProps {
  className?: string;
}

const AuthBackgroundCanvas = ({ className = 'auth-background-canvas' }: AuthBackgroundCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { token } = theme.useToken();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const pointer: PointerState = { x: 0, y: 0, active: false };
    const ripples: Ripple[] = [];
    let lastPointerTimestamp = 0;

    const rgb = hexToRgb(token.colorPrimary);
    const primaryColor = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '24, 144, 255';

    const resizeCanvas = () => {
      const { clientWidth, clientHeight } = canvas;
      if (!clientWidth || !clientHeight) {
        return;
      }
      canvas.width = clientWidth;
      canvas.height = clientHeight;
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(clientWidth, clientHeight));
    };

    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);

      const now = performance.now();
      const pointerEngaged = pointer.active && now - lastPointerTimestamp < 220;
      if (!pointerEngaged) {
        pointer.active = false;
      }

      context.save();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        const elapsed = now - ripple.start;
        if (elapsed > RIPPLE_LIFETIME) {
          ripples.splice(i, 1);
          continue;
        }
        const progress = elapsed / RIPPLE_LIFETIME;
        const radius = progress * RIPPLE_MAX_RADIUS;
        const alpha = 0.28 * (1 - progress);
        context.beginPath();
        context.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
        context.setLineDash([radius * 0.08, radius * 0.12]);
        context.lineWidth = RIPPLE_STROKE_WIDTH * (1 - progress);
        context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      for (const particle of particles) {
        if (pointerEngaged) {
          const dxPointer = particle.x - pointer.x;
          const dyPointer = particle.y - pointer.y;
          const distPointer = Math.hypot(dxPointer, dyPointer);
          if (distPointer < POINTER_INFLUENCE_RADIUS && distPointer > 0) {
            const forceRatio = (POINTER_INFLUENCE_RADIUS - distPointer) / POINTER_INFLUENCE_RADIUS;
            const normX = dxPointer / distPointer;
            const normY = dyPointer / distPointer;
            particle.velocityX += normX * forceRatio * POINTER_FORCE;
            particle.velocityY += normY * forceRatio * POINTER_FORCE;
          }
        }

        context.beginPath();
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          particle.radius * 0.1,
          particle.x,
          particle.y,
          particle.radius,
        );

        const accentAlpha = particle.alpha;
        gradient.addColorStop(0, `rgba(${primaryColor}, ${accentAlpha})`);
        gradient.addColorStop(0.35, `rgba(${primaryColor}, ${accentAlpha * 0.8})`);
        gradient.addColorStop(0.65, `rgba(${primaryColor}, ${accentAlpha * 0.45})`);
        gradient.addColorStop(1, `rgba(${primaryColor}, 0)`);

        context.fillStyle = gradient;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x - particle.radius > width) particle.x = -particle.radius;
        if (particle.x + particle.radius < 0) particle.x = width + particle.radius;
        if (particle.y - particle.radius > height) particle.y = -particle.radius;
        if (particle.y + particle.radius < 0) particle.y = height + particle.radius;

        particle.velocityX *= VELOCITY_DAMPING;
        particle.velocityY *= VELOCITY_DAMPING;
      }

      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECTION_DISTANCE) {
            let alpha = (1 - dist / CONNECTION_DISTANCE) * 0.7;
            let lineWidth = 1.4;

            if (pointerEngaged) {
              const pointerToP1 = Math.hypot(p1.x - pointer.x, p1.y - pointer.y);
              const pointerToP2 = Math.hypot(p2.x - pointer.x, p2.y - pointer.y);
              const pointerDist = Math.min(pointerToP1, pointerToP2);
              if (pointerDist < POINTER_INFLUENCE_RADIUS) {
                const boost = POINTER_CONNECTION_BOOST * (1 - pointerDist / POINTER_INFLUENCE_RADIUS);
                alpha = Math.min(1, alpha + boost * 0.6);
                lineWidth += boost * 2;
              }
            }

            context.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
            context.lineWidth = lineWidth;
            context.beginPath();
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
            context.stroke();

            connections += 1;
            if (connections >= MAX_CONNECTIONS_PER_PARTICLE) {
              break;
            }
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    const updatePointerCoordinates = (event: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointerCoordinates(event);
      pointer.active = true;
      lastPointerTimestamp = performance.now();
    };

    const deactivatePointer = () => {
      pointer.active = false;
    };

    const pushRipple = (event: PointerEvent | MouseEvent) => {
      updatePointerCoordinates(event);
      pointer.active = true;
      lastPointerTimestamp = performance.now();
      ripples.push({ x: pointer.x, y: pointer.y, start: performance.now() });
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', deactivatePointer);
    window.addEventListener('pointercancel', deactivatePointer);
    window.addEventListener('pointerout', deactivatePointer);
    window.addEventListener('pointerleave', deactivatePointer);
    window.addEventListener('pointerdown', pushRipple);
    window.addEventListener('click', pushRipple as EventListener);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', deactivatePointer);
      window.removeEventListener('pointercancel', deactivatePointer);
      window.removeEventListener('pointerout', deactivatePointer);
      window.removeEventListener('pointerleave', deactivatePointer);
      window.removeEventListener('pointerdown', pushRipple);
      window.removeEventListener('click', pushRipple as EventListener);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [token.colorPrimary]);

  return <canvas ref={canvasRef} className={className} />;
};

export default AuthBackgroundCanvas;
