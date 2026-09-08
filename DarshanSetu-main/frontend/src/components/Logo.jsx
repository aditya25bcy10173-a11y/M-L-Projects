import React from 'react';

const Logo = ({ width = 48, height = 48, style = {} }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        {/* Orange gradient for the arcs, flag, and inner temple elements */}
        <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        {/* Blue gradient for the temple structure */}
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* 1. Orange Framing Arcs */}
      <path 
        d="M 40,140 A 70,70 0 1,1 160,140" 
        stroke="url(#orangeGrad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* 2. Deity Silhouette inside the Temple */}
      {/* Crown */}
      <path d="M 98,82 L 100,72 L 102,82 Z" fill="url(#orangeGrad)" />
      {/* Head */}
      <circle cx="100" cy="86" r="3.5" fill="url(#orangeGrad)" />
      {/* Body */}
      <path d="M 93,115 C 93,95 107,95 107,115 Z" fill="url(#orangeGrad)" />

      {/* 3. Golden Bell */}
      <path 
        d="M 97,64 C 97,60 103,60 103,64 L 104,69 C 106,71 106,72 100,72 C 94,72 94,71 96,69 Z" 
        fill="url(#orangeGrad)" 
      />
      <circle cx="100" cy="73" r="1.5" fill="url(#orangeGrad)" />

      {/* 4. Temple Arch (Torana) */}
      <path 
        d="
          M 70,140 L 70,90 
          C 70,90 70,82 78,74 
          C 86,66 94,62 100,62 
          C 106,62 114,66 122,74 
          C 130,82 130,90 130,90 
          L 130,140 
          L 120,140 
          L 120,95 
          C 120,84 112,74 100,74 
          C 88,74 80,84 80,95 
          L 80,140 
          Z
        " 
        fill="url(#blueGrad)" 
      />

      {/* 5. Shikhara (Temple Roof Tiers) */}
      {/* Tier 1 */}
      <path d="M 74,74 C 74,70 126,70 126,74 L 120,64 L 80,64 Z" fill="url(#blueGrad)" />
      {/* Tier 2 */}
      <path d="M 82,64 C 82,60 118,60 118,64 L 112,54 L 88,54 Z" fill="url(#blueGrad)" />
      {/* Tier 3 */}
      <path d="M 90,54 C 90,50 110,50 110,54 L 106,44 L 94,44 Z" fill="url(#blueGrad)" />
      {/* Top Dome */}
      <path d="M 94,44 C 94,36 106,36 106,44 Z" fill="url(#blueGrad)" />
      {/* Spire */}
      <line x1="100" y1="38" x2="100" y2="28" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />

      {/* 6. Orange Flag at the Spire */}
      <line x1="100" y1="28" x2="100" y2="16" stroke="url(#orangeGrad)" strokeWidth="2" />
      <path d="M 100,16 L 116,21 L 100,26 Z" fill="url(#orangeGrad)" />

      {/* 7. Winding Queue of People (Dark Blue) */}
      {/* Person 1 (Foreground, largest) */}
      <circle cx="82" cy="148" r="8" fill="#0f172a" />
      <path d="M 72,185 C 72,165 92,165 92,185 Z" fill="#0f172a" />

      {/* Person 2 */}
      <circle cx="94" cy="154" r="6" fill="#0f172a" />
      <path d="M 86,182 C 86,168 102,168 102,182 Z" fill="#0f172a" />

      {/* Person 3 */}
      <circle cx="102" cy="140" r="5" fill="#0f172a" />
      <path d="M 95,162 C 95,150 109,150 109,162 Z" fill="#0f172a" />

      {/* Person 4 */}
      <circle cx="104" cy="129" r="4" fill="#0f172a" />
      <path d="M 98,147 C 98,138 110,138 110,147 Z" fill="#0f172a" />

      {/* Person 5 */}
      <circle cx="100" cy="120" r="3" fill="#0f172a" />
      <path d="M 95,134 C 95,127 105,127 105,134 Z" fill="#0f172a" />

      {/* Person 6 (Smallest, entering arch) */}
      <circle cx="98" cy="113" r="2" fill="#0f172a" />
      <path d="M 95,123 C 95,118 101,118 101,123 Z" fill="#0f172a" />

      {/* 8. Barricades (Posts and Ropes) */}
      {/* Left rope and posts */}
      <path d="M 52,175 Q 68,183 82,175" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="50" y="160" width="3" height="25" rx="1" fill="#0f172a" />
      <rect x="66" y="164" width="3" height="25" rx="1" fill="#0f172a" />
      
      {/* Right rope and posts */}
      <path d="M 106,177 Q 120,183 136,175" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="106" y="164" width="3" height="25" rx="1" fill="#0f172a" />
      <rect x="121" y="161" width="3" height="25" rx="1" fill="#0f172a" />
      <rect x="136" y="157" width="3" height="25" rx="1" fill="#0f172a" />
    </svg>
  );
};

export default Logo;
