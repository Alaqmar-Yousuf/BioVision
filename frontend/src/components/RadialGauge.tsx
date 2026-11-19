"use client";
import React from "react";

interface CircularConfidenceGaugeProps {
  percentage: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const CircularConfidenceGauge: React.FC<CircularConfidenceGaugeProps> = ({
  percentage,
  size = 86,
  strokeWidth = 6,
  label = "Confidence",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Gradient definition */}
          <defs>
            <linearGradient id="organicLimeGauge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8E6C9" />
              <stop offset="60%" stopColor="#B7F36B" />
              <stop offset="100%" stopColor="#A3E635" />
            </linearGradient>
            <filter id="organicGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#B7F36B" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0B1E17"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Inner calibration ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 2}
            stroke="rgba(200, 230, 201, 0.08)"
            strokeWidth={1}
            strokeDasharray="2 3"
            fill="transparent"
          />

          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#organicLimeGauge)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#organicGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center percentage value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-bold text-[#F3F5EC] font-mono tracking-tight leading-none">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-[#829B87] mt-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

interface SeverityArcGaugeProps {
  penaltyPct: number; // 0.0 to 1.0
  severityLabel: string;
}

export const SeverityArcGauge: React.FC<SeverityArcGaugeProps> = ({
  penaltyPct,
  severityLabel,
}) => {
  const isHealthy = penaltyPct === 0;
  const isModerate = penaltyPct > 0 && penaltyPct <= 0.25;
  const isSevere = penaltyPct > 0.25;

  const color = isHealthy
    ? "#B7F36B"
    : isModerate
    ? "#F59E0B"
    : "#EF4444";

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#071C16]/80 border border-[#C8E6C9]/10">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#102A20] font-mono font-bold text-sm" style={{ color }}>
        -{(penaltyPct * 100).toFixed(0)}%
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#829B87]">Yield Pathology Deficit</div>
        <div className="text-xs font-semibold text-[#F3F5EC]">{severityLabel}</div>
      </div>
    </div>
  );
};
