import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Main Shield Background */}
      <path 
        d="M20 45L100 20L180 45V105C180 145 100 185 100 185C100 185 20 145 20 105V45Z" 
        fill="url(#shieldGrad)" 
        stroke="url(#goldGrad)" 
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* 3 Stars for the 3 Game Modes */}
      <g fill="#fbbf24">
        {/* Left Star (H2H) */}
        <path d="M55 55l3.5 10.5h11l-9 6.5 3.5 10.5-9-6.5-9 6.5 3.5-10.5-9-6.5h11z" />
        {/* Center Star (Gauntlet) - Slightly larger */}
        <path d="M100 35l4.5 13.5h14.5l-11.5 8.5 4.5 14-12-8.5-12 8.5 4.5-14-11.5-8.5h14.5z" />
        {/* Right Star (Chase 300) */}
        <path d="M145 55l3.5 10.5h11l-9 6.5 3.5 10.5-9-6.5-9 6.5 3.5-10.5-9-6.5h11z" />
      </g>

      {/* Crossed Cricket Bats */}
      <g stroke="url(#blueGrad)" strokeWidth="8" strokeLinecap="round">
        <line x1="60" y1="140" x2="140" y2="70" />
        <line x1="140" y1="140" x2="60" y2="70" />
      </g>
      
      {/* Bat Handles (Gold accents) */}
      <g stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="round">
        <line x1="50" y1="150" x2="60" y2="140" />
        <line x1="150" y1="150" x2="140" y2="140" />
      </g>

      {/* Cricket Ball */}
      <circle cx="100" cy="120" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
      {/* Seam */}
      <path d="M96 108c4 8 4 16 0 24m8-24c-4 8-4 16 0 24" stroke="#ffffff" strokeWidth="1.5" fill="none" />

      {/* DRAFT Text inside shield */}
      <text x="100" y="165" fontFamily="sans-serif" fontWeight="bold" fontSize="24" fill="#ffffff" textAnchor="middle" letterSpacing="4">
        DRAFT
      </text>
    </svg>
  );
};
