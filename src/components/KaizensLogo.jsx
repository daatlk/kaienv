import React from 'react';

const KaizensLogo = ({ size = 'md' }) => {
  // Size classes
  const sizeStyle = {
    width: size === 'sm' ? '150px' :
           size === 'lg' ? '280px' :
           '220px',
    height: 'auto',
    marginBottom: '10px'
  };

  return (
    <div className="kaizens-logo" style={{ textAlign: 'center' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 342 80"
        style={sizeStyle}
      >
        {/* Purple bars */}
        <rect x="5" y="10" width="90" height="15" rx="7.5" fill="#9C27B0" />
        <rect x="5" y="32.5" width="90" height="15" rx="7.5" fill="#BA68C8" />
        <rect x="5" y="55" width="90" height="15" rx="7.5" fill="#D1C4E9" />

        {/* KAIZENS text */}
        <path d="M120 15 L120 65 L132 65 L132 43 L150 65 L165 65 L142 40 L165 15 L150 15 L132 35 L132 15 Z" fill="#9C27B0" />
        <path d="M170 15 L182 15 L182 65 L170 65 Z" fill="#9C27B0" />
        <path d="M190 15 L202 15 L232 50 L232 15 L244 15 L244 65 L232 65 L202 30 L202 65 L190 65 Z" fill="#9C27B0" />
        <path d="M250 15 L290 15 L290 27 L262 27 L262 35 L285 35 L285 47 L262 47 L262 53 L290 53 L290 65 L250 65 Z" fill="#9C27B0" />
        <path d="M295 15 L307 15 L307 53 L335 53 L335 65 L295 65 Z" fill="#9C27B0" />
        <path d="M340 15 L340 65 L328 65 L328 15 Z" fill="#9C27B0" />

        {/* GROUP text */}
        <text x="170" y="78" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#9C27B0">GROUP</text>
      </svg>
    </div>
  );
};

export default KaizensLogo;
