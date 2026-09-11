'use client';

import React from 'react';

interface TimelineRulerProps {
  duration: number; // in seconds (e.g. 30)
  currentTime: number; // in seconds
  onSeek: (time: number) => void;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  duration,
  currentTime,
  onSeek,
}) => {
  const rulerMarks = [];
  const step = 5; // seconds
  for (let s = 0; s <= duration; s += step) {
    rulerMarks.push(s);
  }

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={handleRulerClick}
      style={{
        height: '32px',
        background: 'var(--bg-darkest)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Time marks */}
      {rulerMarks.map((sec) => {
        const leftPercent = (sec / duration) * 100;
        return (
          <div
            key={sec}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop: '4px',
              paddingBottom: '2px',
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {sec}
            </span>
            <div style={{ width: '1px', height: '6px', background: 'var(--border-light)', margin: '0 auto' }} />
          </div>
        );
      })}

      {/* Sub-second ticks */}
      {Array.from({ length: duration }).map((_, sec) => {
        if (sec % 5 === 0) return null;
        const leftPercent = (sec / duration) * 100;
        return (
          <div
            key={`sub-${sec}`}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              bottom: 0,
              width: '1px',
              height: '4px',
              background: 'rgba(255,255,255,0.08)',
              pointerEvents: 'none'
            }}
          />
        );
      })}

      {/* Red Playhead Marker on Ruler */}
      <div
        style={{
          position: 'absolute',
          left: `${playheadPercent}%`,
          top: '2px',
          transform: 'translateX(-50%)',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <path
            d="M 1 1 L 13 1 L 13 10 L 7 17 L 1 10 Z"
            fill="var(--playhead-red)"
            stroke="#991b1b"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};
