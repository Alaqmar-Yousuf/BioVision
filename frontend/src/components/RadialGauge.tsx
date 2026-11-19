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
  size = 94,
  strokeWidth = 7,
  label = "Confidence",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="emeraldGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#121F18"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Fine inner calibration ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={1}
            strokeDasharray="2 3"
            fill="transparent"
          />

          {/* Foreground progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#emeraldGaugeGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black font-mono text-white tracking-tighter tabular-nums">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] font-mono font-bold text-brand-muted -mt-0.5">
            MATCH
          </span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-brand-tertiary mt-2">
        {label}
      </span>
    </div>
  );
};

interface SeverityArcGaugeProps {
  penaltyPct: number; // 0, 20, 50
}

export const SeverityArcGauge: React.FC<SeverityArcGaugeProps> = ({ penaltyPct }) => {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const normalized = Math.min(Math.max(penaltyPct, 0), 100);
  const offset = arcLength - (normalized / 100) * arcLength;

  let strokeColor = "#10B981"; // Healthy Green
  let statusText = "0% Penalty";
  let statusColor = "text-brand-primary";

  if (penaltyPct >= 40) {
    strokeColor = "#F59E0B"; // Severe Amber
    statusText = `-${penaltyPct}% Severe`;
    statusColor = "text-amber-400";
  } else if (penaltyPct > 0) {
    strokeColor = "#FBBF24"; // Moderate Yellow
    statusText = `-${penaltyPct}% Moderate`;
    statusColor = "text-yellow-400";
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size / 2 + 12}`}>
          {/* Subtle tick markings at 0%, 25%, 50%, 75%, 100% */}
          <defs>
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="#14211A"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Active Penalty Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={arcLength}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            filter="url(#arcGlow)"
          />
        </svg>

        {/* Value Label */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
          <span className={`text-lg font-black font-mono tracking-tight tabular-nums ${statusColor}`}>
            {penaltyPct === 0 ? "0% Loss" : `-${penaltyPct}%`}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-brand-muted mt-1.5">
        Foliar Impairment
      </span>
    </div>
  );
};
