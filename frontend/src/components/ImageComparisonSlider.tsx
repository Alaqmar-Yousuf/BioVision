"use client";
import React, { useState, useRef } from "react";
import { Sparkles, GripVertical } from "lucide-react";

interface ImageComparisonSliderProps {
  originalImage: string;
  gradcamImage: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalImage,
  gradcamImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={(e) => handleMove(e.clientX)}
        className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-primary/10 cursor-ew-resize bg-black/90 ring-1 ring-white/5 corner-reticle group"
      >
        {/* Background Layer: Grad-CAM Overlay */}
        <img
          src={gradcamImage}
          alt="Grad-CAM Saliency"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Foreground Layer: Original Leaf Photo (Clipped by slider position) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalImage}
            alt="Original Specimen"
            className="absolute inset-0 w-[340px] h-[340px] object-cover max-w-none pointer-events-none"
          />
        </div>

        {/* Vertical Divider Line with Cyan/Emerald Laser Glow */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-tertiary via-brand-primary to-brand-tertiary shadow-[0_0_14px_rgba(45,212,191,1)] pointer-events-none transition-transform"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Tactile Pill Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-10 rounded-full bg-brand-neutral/95 border border-brand-primary/80 text-brand-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <GripVertical className="w-3.5 h-3.5 text-brand-tertiary" />
          </div>
        </div>

        {/* Floating HUD Badges */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider uppercase text-gray-300 border border-white/10 pointer-events-none shadow-md">
          RAW SPECIMEN
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-brand-secondary/90 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider uppercase text-brand-tertiary border border-brand-tertiary/40 pointer-events-none flex items-center gap-1 shadow-md">
          <Sparkles className="w-2.5 h-2.5" /> GRAD-CAM SALIENCY
        </div>
      </div>

      <p className="text-[11px] text-brand-muted mt-3 text-center flex items-center gap-2 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse"></span>
        Slide horizontal divider to inspect neural attention activations
      </p>
    </div>
  );
};
