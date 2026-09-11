'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Lock, Unlock, MoreHorizontal, Copy, Download, Scissors, Trash2 } from 'lucide-react';
import { StemTrack } from '../../types/studio';

interface TrackLaneProps {
  track: StemTrack;
  duration: number;
  currentTime: number;
  onToggleMute: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExportTrack: (id: string) => void;
  onDeleteTrack: (id: string) => void;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  duration,
  currentTime,
  onToggleMute,
  onToggleLock,
  onDuplicate,
  onExportTrack,
  onDeleteTrack,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw high-resolution studio waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Waveform bar parameters
    const barWidth = 2.5;
    const barGap = 1.5;
    const totalBars = Math.floor(width / (barWidth + barGap));
    const seed = track.waveformSeed;

    ctx.fillStyle = track.muted ? '#94a3b8' : track.color;

    for (let i = 0; i < totalBars; i++) {
      const t = i / totalBars;
      const noise =
        Math.sin(i * 0.15 + seed) * 0.4 +
        Math.sin(i * 0.4 + seed * 2) * 0.3 +
        Math.cos(i * 0.8 + seed * 0.5) * 0.3;

      const envelope = Math.sin(t * Math.PI) * 0.85 + 0.15;
      const amplitude = Math.max(0.08, Math.min(1.0, Math.abs(noise) * envelope));
      const barHeight = Math.max(3, amplitude * (height * 0.78));

      const x = i * (barWidth + barGap);
      const y = centerY - barHeight / 2;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1.2);
      ctx.fill();
    }

    // Volume envelope automation
    if (track.envelopeCurve) {
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      ctx.lineTo(width * 0.45, height * 0.65);
      ctx.lineTo(width * 0.82, height * 0.22);
      ctx.lineTo(width, height * 0.22);
      ctx.stroke();

      // Node handles
      const points = [
        { x: width * 0.45, y: height * 0.65 },
        { x: width * 0.82, y: height * 0.22 }
      ];
      points.forEach(pt => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [track.color, track.muted, track.waveformSeed, track.envelopeCurve]);

  return (
    <div style={{
      height: '115px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      background: '#ffffff',
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Left Track Header Controls */}
      <div style={{
        width: '64px',
        height: '100%',
        borderRight: '1px solid var(--border-subtle)',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        zIndex: 10
      }}>
        {/* Track Menu Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex'
            }}
            title="Track options"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Context Menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                left: '28px',
                top: '0',
                width: '150px',
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '4px',
                zIndex: 50
              }}
            >
              <button
                onClick={() => { onDuplicate(track.id); setMenuOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Copy size={13} />
                <span>Duplicate track</span>
              </button>

              <button
                onClick={() => { onExportTrack(track.id); setMenuOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Download size={13} />
                <span>Export track</span>
              </button>

              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Scissors size={13} />
                <span>Split channels</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => { onDeleteTrack(track.id); setMenuOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  color: '#dc2626',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Mute Button */}
        <button
          onClick={() => onToggleMute(track.id)}
          style={{
            color: track.muted ? '#dc2626' : 'var(--text-secondary)',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex'
          }}
          title={track.muted ? 'Unmute Track' : 'Mute Track'}
        >
          {track.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Lock Button */}
        <button
          onClick={() => onToggleLock(track.id)}
          style={{
            color: track.locked ? 'var(--accent-purple)' : 'var(--text-muted)',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex'
          }}
          title={track.locked ? 'Unlock Track' : 'Lock Track'}
        >
          {track.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
      </div>

      {/* Main Waveform Canvas Body */}
      <div style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
        {/* Track Label Badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          fontSize: '11px',
          fontWeight: 700,
          color: track.color,
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          background: '#ffffff',
          padding: '2px 8px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          {track.name}
        </div>

        {/* Canvas Visualizer */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Timestamp Annotation Avatars */}
        {track.markers?.map((marker) => {
          const leftPercent = (marker.time / duration) * 100;
          return (
            <div
              key={marker.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: '12px',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--accent-purple)',
                background: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'var(--text-primary)',
                fontWeight: 700
              }}>
                {marker.avatarUrl ? (
                  <img src={marker.avatarUrl} alt={marker.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  marker.label.slice(0, 2)
                )}
              </div>
              <div style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '5px solid var(--accent-purple)'
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
