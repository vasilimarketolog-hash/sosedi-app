import React from 'react';

export const BelarusFlagSvg: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg 
    width={Math.round(size * 1.4)} 
    height={size} 
    viewBox="0 0 28 20" 
    className={className} 
    style={{ display: 'inline-block', verticalAlign: '-2px', borderRadius: 3, boxShadow: '0 0 1px rgba(0,0,0,0.3)', flexShrink: 0 }}
  >
    <rect width="28" height="13.33" fill="#C8102E" />
    <rect y="13.33" width="28" height="6.67" fill="#007A3D" />
    <rect width="5.5" height="20" fill="#FFFFFF" />
    <path d="M2.75 1 L5 5 L2.75 9 L0.5 5 Z M2.75 11 L5 15 L2.75 19 L0.5 15 Z" fill="#C8102E" />
  </svg>
);

export const KazakhstanFlagSvg: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg 
    width={Math.round(size * 1.4)} 
    height={size} 
    viewBox="0 0 28 20" 
    className={className} 
    style={{ display: 'inline-block', verticalAlign: '-2px', borderRadius: 3, boxShadow: '0 0 1px rgba(0,0,0,0.3)', flexShrink: 0 }}
  >
    <rect width="28" height="20" fill="#00AFCA" />
    <circle cx="14" cy="9" r="3.5" fill="#FEC50C" />
    <path d="M10 14 Q14 11 18 14" stroke="#FEC50C" strokeWidth="1.2" fill="none" />
  </svg>
);
