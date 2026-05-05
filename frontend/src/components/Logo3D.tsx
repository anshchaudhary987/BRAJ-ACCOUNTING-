'use client';

import React, { memo } from 'react';

// Pure CSS animated tetrahedron logo — zero GPU canvas overhead
const Logo3D = memo(() => {
  return (
    <div className="w-10 h-10 relative flex items-center justify-center">
      <div 
        className="w-7 h-7 bg-white rotate-45 rounded-sm animate-[spin_8s_linear_infinite]"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          opacity: 0.9,
        }}
      />
      <div 
        className="absolute w-5 h-5 bg-white/30 rotate-45 rounded-sm animate-[spin_12s_linear_infinite_reverse]"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        }}
      />
    </div>
  );
});

Logo3D.displayName = 'Logo3D';
export default Logo3D;
