'use client';

import { useState } from 'react';

export default function FlipCard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.8s',
      }}
    >
      <div
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : '',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s',
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: isFlipped ? 'absolute' : 'relative',
          }}
          onClick={() => setIsFlipped(true)}
        >
          {front}
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: isFlipped ? 'relative' : 'absolute',
            top: 0,
          }}
          onClick={() => setIsFlipped(false)}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
