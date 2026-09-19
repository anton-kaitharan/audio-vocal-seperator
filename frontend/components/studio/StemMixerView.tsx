'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Archive,
  Sliders,
  Sparkles,
  PlusCircle,
  FolderOpen,
  Music,
  Check,
  RotateCcw
} from 'lucide-react';
import { StemTrack } from '../../types/studio';
import { getProjectZipUrl, BACKEND_URL } from '../../lib/api';

interface StemMixerViewProps {
  projectTitle: string;
  projectId: string;
  tracks: StemTrack[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  masterVolume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onMasterVolumeChange: (vol: number) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onTrackVolumeChange: (id: string, vol: number) => void;
  onNewProject: () => void;
  onOpenStudio: () => void;
  onOpenLibrary: () => void;
}

// Waveform Canvas component for each stem row
const StemWaveform: React.FC<{
  track: StemTrack;
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}> = ({ track, duration, currentTime, onSeek }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const barWidth = 2.5;
    const barGap = 1.5;
    const totalBars = Math.floor(width / (barWidth + barGap));
    const seed = track.waveformSeed;

    const progressRatio = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < totalBars; i++) {
      const t = i / totalBars;
      const isPast = t <= progressRatio;

      const noise =
        Math.sin(i * 0.18 + seed) * 0.45 +
        Math.sin(i * 0.45 + seed * 2) * 0.3 +
        Math.cos(i * 0.9 + seed * 0.5) * 0.25;

      const envelope = Math.sin(t * Math.PI) * 0.85 + 0.15;
      const amplitude = Math.max(0.1, Math.min(1.0, Math.abs(noise) * envelope));
      const barHeight = Math.max(3, amplitude * (height * 0.75));

      const x = i * (barWidth + barGap);
      const y = centerY - barHeight / 2;

      ctx.fillStyle = track.muted
        ? '#cbd5e1'
        : isPast
          ? track.color
          : '#e2e8f0';

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1.2);
      ctx.fill();
    }
  }, [track.color, track.muted, track.waveformSeed, duration, currentTime]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div style={{ flex: 1, height: '56px', position: 'relative', cursor: 'pointer' }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export const StemMixerView: React.FC<StemMixerViewProps> = ({
  projectTitle,
  projectId,
  tracks,
  duration,
  currentTime,
  isPlaying,
  masterVolume,
  onTogglePlay,
  onSeek,
  onMasterVolumeChange,
  onToggleMute,
  onToggleSolo,
  onTrackVolumeChange,
  onNewProject,
  onOpenStudio,
  onOpenLibrary
}) => {
  const [downloadingZip, setDownloadingZip] = useState(false);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadAllZip = () => {
    setDownloadingZip(true);
    const url = getProjectZipUrl(projectId || projectTitle);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_stems.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloadingZip(false), 2000);
  };

  const handleDownloadSingle = (track: StemTrack) => {
    if (!track.audioUrl) return;
    const a = document.createElement('a');
    a.href = track.audioUrl.startsWith('http') ? track.audioUrl : `${BACKEND_URL}${track.audioUrl}`;
    a.download = `${projectTitle}_${track.type}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg-main)',
      overflow: 'hidden'
    }}>
      {/* Top Banner: Project Title, Quick Stats, Actions */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(185, 240, 59, 0.3)'
          }}>
            <Music size={20} color="#0E0E0E" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
                {projectTitle}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                Ready • {tracks.length} Stems
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Isolated with Demucs v4 AI • Mastered 44.1kHz 16-bit
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onNewProject}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-elevated)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={14} color="var(--color-primary)" />
            <span>New Separation</span>
          </button>

          <button
            onClick={onOpenLibrary}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-elevated)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          >
            <FolderOpen size={14} color="var(--color-primary)" />
            <span>Library</span>
          </button>

          <button
            onClick={handleDownloadAllZip}
            disabled={downloadingZip}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Archive size={15} />
            <span>{downloadingZip ? 'Packaging Zip...' : 'Download All (.zip)'}</span>
          </button>

          {/* Opt-in to Advanced Studio */}
          <button
            onClick={onOpenStudio}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(185, 240, 59, 0.12)',
              border: '1px solid rgba(185, 240, 59, 0.3)',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(185, 240, 59, 0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(185, 240, 59, 0.12)')}
          >
            <Sliders size={14} />
            <span>Open in Advanced Studio</span>
          </button>
        </div>
      </div>

      {/* Master Transport Bar */}
      <div style={{
        padding: '12px 28px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
            color: '#0E0E0E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(185, 240, 59, 0.3)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={18} fill="#0E0E0E" color="#0E0E0E" /> : <Play size={18} fill="#0E0E0E" color="#0E0E0E" style={{ marginLeft: '2px' }} />}
        </button>

        {/* Time Stamp */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minWidth: '100px'
        }}>
          <span>{formatTime(currentTime)}</span>
          <span style={{ color: 'var(--color-text-secondary)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{formatTime(duration)}</span>
        </div>

        {/* Master Progress Slider */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={currentTime}
            onChange={e => onSeek(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Master Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
          <Volume2 size={16} color="var(--color-text-secondary)" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={e => onMasterVolumeChange(parseFloat(e.target.value))}
            style={{ width: '80px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', width: '32px' }}>
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Stems List Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'var(--color-bg-main)'
      }}>
        {tracks.map((track) => {
          return (
            <div
              key={track.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                opacity: track.muted ? 0.65 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Left Color Bar & Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '180px',
                flexShrink: 0
              }}>
                <div style={{
                  width: '4px',
                  height: '36px',
                  borderRadius: '2px',
                  background: track.color
                }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {track.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {track.type} stem
                  </div>
                </div>
              </div>

              {/* Mute (M) & Solo (S) Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => onToggleMute(track.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: track.muted ? '#ef4444' : '#f1f5f9',
                    color: track.muted ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: track.muted ? '#ef4444' : 'var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title={track.muted ? 'Unmute track' : 'Mute track'}
                >
                  M
                </button>
                <button
                  onClick={() => onToggleSolo(track.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: track.soloed ? '#eab308' : '#f1f5f9',
                    color: track.soloed ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: track.soloed ? '#eab308' : 'var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title={track.soloed ? 'Unsolo track' : 'Solo track'}
                >
                  S
                </button>
              </div>

              {/* Volume Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', flexShrink: 0 }}>
                <Volume2 size={15} color="var(--text-muted)" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={track.volume}
                  onChange={e => onTrackVolumeChange(track.id, parseFloat(e.target.value))}
                  style={{ width: '70px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '28px' }}>
                  {Math.round(track.volume * 100)}
                </span>
              </div>

              {/* Waveform Visualization */}
              <StemWaveform
                track={track}
                duration={duration}
                currentTime={currentTime}
                onSeek={onSeek}
              />

              {/* Single Stem Download Button */}
              <button
                onClick={() => handleDownloadSingle(track)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = track.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                title={`Download ${track.name} WAV`}
              >
                <Download size={14} />
                <span>WAV</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
