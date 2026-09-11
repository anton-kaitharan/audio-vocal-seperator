'use client';

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Disc3, Radio } from 'lucide-react';

interface TransportBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  bpm: number;
  keySignature: string;
  onPlayPause: () => void;
  onSeekRelative: (delta: number) => void;
  onVolumeChange: (vol: number) => void;
}

function formatSeconds(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  bpm,
  keySignature,
  onPlayPause,
  onSeekRelative,
  onVolumeChange,
}) => {
  return (
    <div style={{
      height: '54px',
      background: '#ffffff',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      userSelect: 'none',
      zIndex: 35
    }}>
      {/* Left: Tempo & Key */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <Disc3 size={13} color="var(--accent-purple)" />
          <span style={{ color: 'var(--text-muted)' }}>BPM:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bpm}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <Radio size={13} color="#0284c7" />
          <span style={{ color: 'var(--text-muted)' }}>KEY:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{keySignature}</span>
        </div>
      </div>

      {/* Center: Transport Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onSeekRelative(-5)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            background: '#f8fafc',
            border: '1px solid var(--border-light)'
          }}
          title="Rewind 5s"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={onPlayPause}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-purple)',
            color: '#fff',
            boxShadow: '0 2px 10px var(--accent-purple-glow)',
            transition: 'transform 0.1s ease'
          }}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={() => onSeekRelative(5)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            background: '#f8fafc',
            border: '1px solid var(--border-light)'
          }}
          title="Fast Forward 5s"
        >
          <RotateCw size={15} />
        </button>

        {/* Time Display */}
        <div style={{
          marginLeft: '12px',
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          padding: '4px 12px',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.5px',
          color: 'var(--text-primary)'
        }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatSeconds(currentTime)}</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{formatSeconds(duration)}</span>
        </div>
      </div>

      {/* Right: Master Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
          style={{ color: 'var(--text-secondary)', display: 'flex' }}
        >
          {volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <div style={{ width: '90px' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
