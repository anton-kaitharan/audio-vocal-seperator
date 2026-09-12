'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MacTitlebar } from '../../components/studio/MacTitlebar';
import { ToolDock } from '../../components/studio/ToolDock';
import { InspectorPanel } from '../../components/studio/InspectorPanel';
import { TimelineRuler } from '../../components/studio/TimelineRuler';
import { TrackLane } from '../../components/studio/TrackLane';
import { TransportBar } from '../../components/studio/TransportBar';
import { ImportModal } from '../../components/studio/ImportModal';
import { ExportModal } from '../../components/studio/ExportModal';
import { StemTrack, InspectorState } from '../../types/studio';

export default function StudioPage() {
  const [projectTitle, setProjectTitle] = useState('Bohemian_Rhapsody_AI_Stems');
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(14.2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [activeTool, setActiveTool] = useState('select');
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Inspector State
  const [inspector, setInspector] = useState<InspectorState>({
    fadeType: 'none',
    bezierParams: '0, 0.5, 1, 0.5',
    envelopeAmp: 500,
    selectedEffect: 'Reverse audio',
    playbackSpeed: 110.5,
    pitchShiftHz: 441.4,
    pitchShiftSemitones: 0,
    reverbDelay: 120,
    reverbDecay: 35,
  });

  // Stems Tracks matching screenshot
  const [tracks, setTracks] = useState<StemTrack[]>([
    {
      id: 'track-1',
      name: 'Vocals (Lead AI Stem)',
      type: 'vocals',
      color: 'var(--stem-vocals)',
      muted: false,
      soloed: false,
      locked: false,
      volume: 0.9,
      waveformSeed: 42,
      envelopeCurve: {
        points: [
          { x: 0.45, y: 0.65 },
          { x: 0.82, y: 0.22 }
        ]
      }
    },
    {
      id: 'track-2',
      name: 'Backing & Harmonies',
      type: 'backing',
      color: 'var(--stem-backing)',
      muted: false,
      soloed: false,
      locked: true,
      volume: 0.8,
      waveformSeed: 88,
    },
    {
      id: 'track-3',
      name: 'Drums & Acoustic Stems',
      type: 'drums',
      color: 'var(--stem-drums)',
      muted: false,
      soloed: false,
      locked: false,
      volume: 0.85,
      waveformSeed: 19,
      markers: [
        { id: 'm1', time: 14.8, label: 'Solo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face' },
        { id: 'm2', time: 15.6, label: 'Chorus', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face' }
      ]
    },
    {
      id: 'track-4',
      name: 'Bass & Low End',
      type: 'bass',
      color: 'var(--stem-bass)',
      muted: false,
      soloed: false,
      locked: false,
      volume: 0.75,
      waveformSeed: 104,
      markers: [
        { id: 'm3', time: 18.2, label: 'Drop', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face' }
      ]
    }
  ]);

  // Audio Playhead Timer Loop
  const playRef = useRef<number | null>(null);
  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        setCurrentTime((prev) => {
          const next = prev + 0.05 * (inspector.playbackSpeed / 100);
          return next >= duration ? 0 : next;
        });
        playRef.current = requestAnimationFrame(step);
      };
      playRef.current = requestAnimationFrame(step);
    } else if (playRef.current) {
      cancelAnimationFrame(playRef.current);
    }
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, [isPlaying, duration, inspector.playbackSpeed]);

  const handleToggleMute = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const handleToggleLock = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, locked: !t.locked } : t));
  };

  const handleDuplicate = (id: string) => {
    const orig = tracks.find(t => t.id === id);
    if (!orig) return;
    const copy: StemTrack = {
      ...orig,
      id: `track-${Date.now()}`,
      name: `${orig.name} (Copy)`,
      waveformSeed: orig.waveformSeed + 7
    };
    setTracks([...tracks, copy]);
  };

  const handleDeleteTrack = (id: string) => {
    if (tracks.length <= 1) return;
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleExportTrack = (id: string) => {
    setExportOpen(true);
  };

  const handleInspectorChange = (updated: Partial<InspectorState>) => {
    setInspector(prev => ({ ...prev, ...updated }));
  };

  const handleApplyEffect = (effectName: string) => {
    setTracks(tracks.map(t => ({ ...t, waveformSeed: t.waveformSeed + 12 })));
  };

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      {/* 1. Top Mac Titlebar */}
      <MacTitlebar
        projectTitle={projectTitle}
        onImportClick={() => setImportOpen(true)}
        onExportClick={() => setExportOpen(true)}
        activeRoute="studio"
      />

      {/* 2. Middle Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Slim Tool Dock */}
        <ToolDock activeTool={activeTool} onSelectTool={setActiveTool} />

        {/* Left Inspector Sidebar */}
        <InspectorPanel
          inspector={inspector}
          onChange={handleInspectorChange}
          onApplyEffect={handleApplyEffect}
        />

        {/* Main Multi-track Timeline Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Top Timeline Ruler */}
          <TimelineRuler
            duration={duration}
            currentTime={currentTime}
            onSeek={setCurrentTime}
          />

          {/* Tracks Viewport with Synchronized Vertical Scrub Line */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            background: '#ffffff'
          }}>
            {/* Synchronized Red Playhead Scrub Line crossing all tracks */}
            <div
              style={{
                position: 'absolute',
                left: `calc(64px + (100% - 64px) * ${playheadPercent / 100})`,
                top: 0,
                bottom: 0,
                width: '1.5px',
                background: 'var(--playhead-red)',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
                zIndex: 25,
                pointerEvents: 'none'
              }}
            />

            {/* Track Lanes */}
            {tracks.map(track => (
              <TrackLane
                key={track.id}
                track={track}
                duration={duration}
                currentTime={currentTime}
                onToggleMute={handleToggleMute}
                onToggleLock={handleToggleLock}
                onDuplicate={handleDuplicate}
                onExportTrack={handleExportTrack}
                onDeleteTrack={handleDeleteTrack}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Transport Bar */}
      <TransportBar
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        bpm={128}
        keySignature="F# Minor"
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSeekRelative={(delta) => setCurrentTime(Math.max(0, Math.min(duration, currentTime + delta)))}
        onVolumeChange={setVolume}
      />

      {/* Modals */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={(trackName, url) => {
          setProjectTitle(trackName.replace(/ /g, '_'));
          if (url) setDownloadUrl(url);
        }}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        projectTitle={projectTitle}
        downloadUrl={downloadUrl}
      />
    </div>
  );
}
