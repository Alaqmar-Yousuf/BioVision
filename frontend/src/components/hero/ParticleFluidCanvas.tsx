"use client";

import React, { useEffect, useRef } from "react";

export function ParticleFluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      return { w, h };
    };

    let { w: width, h: height } = updateDimensions();

    // Saturated Bioluminescent Palette
    const palette = [
      { r: 183, g: 243, b: 107 }, // Radiant Lime #B7F36B
      { r: 0, g: 240, b: 255 },   // Neon Cyan #00F0FF
      { r: 16, g: 215, b: 140 },  // Emerald Chlorophyll
      { r: 255, g: 195, b: 45 },  // Solar Gold
      { r: 120, g: 255, b: 180 }, // Bright Mint Spore
    ];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      radius: number;
      color: { r: number; g: number; b: number };
      baseAlpha: number;
      alpha: number;
      depth: number; // 0.2 (distant) to 1.0 (foreground)
      pulseSpeed: number;
      pulseAngle: number;
      highlightAlpha: number;
    }

    // Interactive mouse trail micro-spores
    interface TrailSpore {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: { r: number; g: number; b: number };
      alpha: number;
      life: number;
    }

    const trailSpores: TrailSpore[] = [];

    // Scale particle count to screen size (optimal density without clutter)
    const particleCount = Math.min(Math.floor((width * height) / 7500), 170);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const depth = 0.25 + Math.random() * 0.75;
      const baseRadius = 1.2 + depth * 2.8;
      const baseAlpha = 0.35 + depth * 0.5;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (0.35 + depth * 0.35),
        vy: (Math.random() - 0.5) * (0.35 + depth * 0.35),
        baseRadius,
        radius: baseRadius,
        color,
        baseAlpha,
        alpha: baseAlpha,
        depth,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulseAngle: Math.random() * Math.PI * 2,
        highlightAlpha: 0,
      });
    }

    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      radius: 220,
    };

    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];

    let lastSpawnTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      mouse.vx = currentX - (mouse.prevX === -1000 ? currentX : mouse.prevX);
      mouse.vy = currentY - (mouse.prevY === -1000 ? currentY : mouse.prevY);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = currentX;
      mouse.y = currentY;

      // Spawn subtle interactive glowing micro-spores on mouse movement
      const now = performance.now();
      if (now - lastSpawnTime > 30 && Math.hypot(mouse.vx, mouse.vy) > 1.5) {
        lastSpawnTime = now;
        const color = palette[Math.floor(Math.random() * palette.length)];
        trailSpores.push({
          x: currentX + (Math.random() - 0.5) * 14,
          y: currentY + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 0.8 - mouse.vx * 0.05,
          vy: (Math.random() - 0.5) * 0.8 - mouse.vy * 0.05,
          radius: 1.5 + Math.random() * 2,
          color,
          alpha: 0.75,
          life: 1.0,
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.prevX = -1000;
      mouse.prevY = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 8,
        maxRadius: 280,
        alpha: 1.0,
      });

      // Burst of sparkling spores on click
      for (let k = 0; k < 12; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.8;
        const color = palette[Math.floor(Math.random() * palette.length)];
        trailSpores.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.8 + Math.random() * 2.2,
          color,
          alpha: 0.9,
          life: 1.0,
        });
      }
    };

    const handleResize = () => {
      const dims = updateDimensions();
      width = dims.w;
      height = dims.h;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("resize", handleResize);

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      // 1. Process Click Shockwaves & Light Up Nearby Particles
      for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwaves[sIdx];
        sw.radius += 8;
        sw.alpha *= 0.93;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(183, 243, 107, ${sw.alpha * 0.7})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Briefly illuminate particles hit by the shockwave
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const distToWave = Math.abs(Math.hypot(p.x - sw.x, p.y - sw.y) - sw.radius);
          if (distToWave < 25) {
            p.highlightAlpha = Math.max(p.highlightAlpha, sw.alpha * 0.6);
          }
        }

        if (sw.alpha < 0.02 || sw.radius > sw.maxRadius) {
          shockwaves.splice(sIdx, 1);
        }
      }

      // 2. Render Interactive Cursor Spore Trail
      for (let tIdx = trailSpores.length - 1; tIdx >= 0; tIdx--) {
        const sp = trailSpores[tIdx];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.life -= 0.025;

        if (sp.life <= 0) {
          trailSpores.splice(tIdx, 1);
          continue;
        }

        const { r, g, b } = sp.color;
        const currentAlpha = sp.alpha * sp.life;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.fill();
      }

      // 3. Connect Nearby Particles with Organic Synaptic Filaments
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const maxDist = 88;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.22 * p1.depth * p2.depth;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(183, 243, 107, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 4. Update & Render Bioluminescent Particles with Radial Halos
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Decay highlight from shockwaves
        p.highlightAlpha *= 0.92;

        // Organic biological breathing pulsation
        p.pulseAngle += p.pulseSpeed;
        p.alpha = Math.min(1, Math.max(0.25, p.baseAlpha + Math.sin(p.pulseAngle) * 0.25 + p.highlightAlpha));

        // Subtle ambient organic flow field (gentle floating drift)
        const flowAngle = Math.sin(p.y * 0.0025 + time) * Math.cos(p.x * 0.0025 + time);
        p.vx += Math.cos(flowAngle) * 0.018 * p.depth;
        p.vy += Math.sin(flowAngle) * 0.018 * p.depth;

        // Interactive Mouse Swirling Vortex & Dynamic Momentum
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          const factor = (1 - dist / mouse.radius);
          const angle = Math.atan2(dy, dx);
          
          // Tangential vortex eddy (smooth fluid rotation around cursor)
          p.vx += -Math.sin(angle) * factor * 2.5 * (0.8 + p.depth * 0.4);
          p.vy += Math.cos(angle) * factor * 2.5 * (0.8 + p.depth * 0.4);

          // Radial repulsion
          p.vx -= (dx / dist) * factor * 1.4;
          p.vy -= (dy / dist) * factor * 1.4;

          // Momentum transfer from cursor speed
          p.vx += mouse.vx * 0.035 * factor;
          p.vy += mouse.vy * 0.035 * factor;
        }

        // Gentle friction for soothing deceleration
        p.vx *= 0.965;
        p.vy *= 0.965;

        p.x += p.vx;
        p.y += p.vy;

        // Seamless wrap around screen boundaries
        if (p.x < -25) p.x = width + 25;
        if (p.x > width + 25) p.x = -25;
        if (p.y < -25) p.y = height + 25;
        if (p.y > height + 25) p.y = -25;

        const { r, g, b } = p.color;

        // Draw Bioluminescent Radial Gradient (Glowing Core + Soft Halo)
        const haloRadius = p.radius * (2.2 + p.depth * 1.2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, p.alpha * 1.2)})`); // Intense white-hot center
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.85})`);      // Saturated core
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.25})`);       // Soft glowing halo
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);                         // Transparent fade

        ctx.beginPath();
        ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
