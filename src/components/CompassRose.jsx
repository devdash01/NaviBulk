// Authentic Admiralty Cartographic Compass Rose SVG Emblem
import React from 'react';

export default function CompassRose({ size = 48, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Admiralty Compass Rose"
    >
      {/* Outer Ring & Degree Marks */}
      <circle cx="50" cy="50" r="46" stroke="#0E1D31" strokeWidth="1" strokeDasharray="1.5 2.5" />
      <circle cx="50" cy="50" r="43" stroke="#0E1D31" strokeWidth="0.75" />
      <circle cx="50" cy="50" r="39" stroke="#B8860B" strokeWidth="0.5" />

      {/* Cardinal Letters */}
      <text x="50" y="11" textAnchor="middle" fill="#0E1D31" fontFamily="'Cinzel', serif" fontSize="8" fontWeight="800">N</text>
      <text x="50" y="96" textAnchor="middle" fill="#0E1D31" fontFamily="'Cinzel', serif" fontSize="7" fontWeight="700">S</text>
      <text x="93" y="52.5" textAnchor="middle" fill="#0E1D31" fontFamily="'Cinzel', serif" fontSize="7" fontWeight="700">E</text>
      <text x="7" y="52.5" textAnchor="middle" fill="#0E1D31" fontFamily="'Cinzel', serif" fontSize="7" fontWeight="700">W</text>

      {/* 4 Diagonal Points (Secondary Star) */}
      <polygon points="50,50 45,45 28,28 50,50" fill="#607590" />
      <polygon points="50,50 55,45 72,28 50,50" fill="#273E5F" />
      <polygon points="50,50 55,55 72,72 50,50" fill="#607590" />
      <polygon points="50,50 45,55 28,72 50,50" fill="#273E5F" />

      {/* North Primary Point (Brass Gold & Deep Navy) */}
      <polygon points="50,50 47,40 50,14 50,50" fill="#B8860B" />
      <polygon points="50,50 53,40 50,14 50,50" fill="#0E1D31" />

      {/* South Primary Point */}
      <polygon points="50,50 47,60 50,86 50,50" fill="#273E5F" />
      <polygon points="50,50 53,60 50,86 50,50" fill="#B8860B" />

      {/* East Primary Point */}
      <polygon points="50,50 60,47 86,50 50,50" fill="#B8860B" />
      <polygon points="50,50 60,53 86,50 50,50" fill="#0E1D31" />

      {/* West Primary Point */}
      <polygon points="50,50 40,47 14,50 50,50" fill="#273E5F" />
      <polygon points="50,50 40,53 14,50 50,50" fill="#B8860B" />

      {/* Center Pivot Boss */}
      <circle cx="50" cy="50" r="4.5" fill="#B8860B" stroke="#0E1D31" strokeWidth="1" />
      <circle cx="50" cy="50" r="2" fill="#FAF7F0" />
    </svg>
  );
}
