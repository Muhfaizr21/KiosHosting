import React from 'react';

export function Logo({ className = "", theme = "light", iconOnly = false, size = "md" }) {
  const textColor = theme === "dark" ? "text-white" : "text-slate-900";
  const dotColor = theme === "dark" ? "text-cyan-400" : "text-blue-600";
  
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${iconSizes[size]} shrink-0 drop-shadow-sm`}>
        <rect x="2" y="6" width="32" height="24" rx="8" fill="url(#grad_logo)" />
        <circle cx="10" cy="18" r="3" fill="white" />
        <circle cx="19" cy="18" r="3" fill="white" fillOpacity="0.6" />
        <circle cx="28" cy="18" r="3" fill="white" fillOpacity="0.25" />
        <defs>
          <linearGradient id="grad_logo" x1="2" y1="6" x2="34" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      {!iconOnly && (
        <span className={`font-display ${textSizes[size]} font-bold tracking-tight ${textColor}`}>
          KiosHosting<span className={`font-normal ${dotColor}`}>.id</span>
        </span>
      )}
    </div>
  );
}
