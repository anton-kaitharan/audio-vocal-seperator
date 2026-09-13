'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MacTitlebar } from '../../components/studio/MacTitlebar';
import { ToolDock } from '../../components/studio/ToolDock';
import { InspectorPanel } from '../../components/studio/InspectorPanel';
import { TimelineRuler } from '../../components/studio/TimelineRuler';
import { TrackLane } from '../../components/studio/TrackLane';
import { TransportBar } from '../../components/studio/TransportBar';
import { ImportModal } from '../../components/studio/ImportModal';
import { ExportModal } from '../../components/studio/ExportModal';
import { StemTrack, InspectorState } from '../../types/studio';
import { fetchProjectsList, BACKEND_URL } from '../../lib/api';
import { FolderOpen, Music, Clock, Disc, X, Loader2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProjectEntry {
  id: string;
  title: string;
  mtime: number;
  stems: Record<string, string>;
  audio_urls: Record<string, string>;
}

// ─── Audio Engine: manages real HTML5 Audio elements per stem ─────────────────
function useAudioEngine(tracks: StemTrack[], masterVolume: number, isPlaying: boolean, currentTime: number) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Create / destroy Audio elements on track changes
  useEffect(() => {
    const current = audioRefs.current;
    const activeIds = new Set(tracks.map(t => t.id));

    // Remove stale
    for (const id of Object.keys(current)) {
      if (!activeIds.has(id)) {
        current[id].pause();
        current[id].src = '';
        delete current[id];
      }
    }

    // Add new
    for (const track of tracks) {
      if (track.audioUrl && !current[track.id]) {
        const audio = new Audio(track.audioUrl);
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        current[track.id] = audio;
      }
    }

    return () => {
      for (const a of Object.values(current)) {
        a.pause();
        a.src = '';
      }
      audioRefs.current = {};
    };
  }, [tracks.map(t => `${t.id}:${t.audioUrl}`).join(',')]);

  // Play / pause sync
  useEffect(() => {
    for (const track of tracks) {
      const audio = audioRefs.current[track.id];
      if (!audio) continue;

      const shouldMute = track.muted || (tracks.some(t => t.soloed) && !track.soloed);
      audio.volume = shouldMute ? 0 : track.volume * masterVolume;

      if (isPlaying) {
        if (audio.paused) {
          audio.currentTime = currentTime;
          audio.play().catch(() => { /* autoplay blocked */ });
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Volume / mute / solo sync (while playing)
  useEffect(() => {
    for (const track of tracks) {
      const audio = audioRefs.current[track.id];
      if (!audio) continue;
      const shouldMute = track.muted || (tracks.some(t => t.soloed) && !track.soloed);
      audio.volume = shouldMute ? 0 : track.volume * masterVolume;
    }
  }, [tracks, masterVolume]);

  // Seek sync
  const seekAll = useCallback((time: number) => {
    for (const audio of Object.values(audioRefs.current)) {
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(time, audio.duration);
      }
    }
  }, []);

  // Get real playback time from first active audio element
  const getRealTime = useCallback((): number | null => {
    for (const track of tracks) {
      const audio = audioRefs.current[track.id];
      if (audio && !audio.paused && Number.isFinite(audio.currentTime)) {
        return audio.currentTime;
      }
    }
    return null;
  }, [tracks]);

  // Get duration from first audio that has loaded metadata
  const getRealDuration = useCallback((): number | null => {
    for (const track of tracks) {
      const audio = audioRefs.current[track.id];
      if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        return audio.duration;
      }
    }
    return null;
  }, [tracks]);

  return { seekAll, getRealTime, getRealDuration };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [projectTitle, setProjectTitle] = useState('Bohemian_Rhapsody_AI_Stems');
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [activeTool, setActiveTool] = useState('select');
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Library state
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Inspector State
  const [inspector, setInspector] = useState<InspectorState>({
    fadeType: 'none',
    bezierParams: '0, 0.5, 1, 0.5',
    envelopeAmp: 500,
    selectedEffect: 'Reverse audio',
    playbackSpeed: 100,
    pitchShiftHz: 441.4,
    pitchShiftSemitones: 0,
    reverbDelay: 120,
    reverbDecay: 35,
  });

  // Stems Tracks
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

  // Audio Engine
  const { seekAll, getRealTime, getRealDuration } = useAudioEngine(tracks, volume, isPlaying, currentTime);

  // Playhead Timer Loop — uses real audio time if available, falls back to animation
  const playRef = useRef<number | null>(null);
  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        const realTime = getRealTime();
        if (realTime !== null) {
          setCurrentTime(realTime);
          // Also update duration from real audio if we haven't yet
          const realDur = getRealDuration();
          if (realDur && Math.abs(realDur - duration) > 1) {
            setDuration(realDur);
          }
        } else {
          // Fallback: animate playhead at playback speed
          setCurrentTime((prev) => {
            const next = prev + 0.05 * (inspector.playbackSpeed / 100);
            return next >= duration ? 0 : next;
          });
        }
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

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    seekAll(time);
  };

  // Library: load projects
  const loadLibrary = async () => {
    setLibraryOpen(true);
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsList();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    }
    setLoadingProjects(false);
  };

  // Library: load project into Studio
  const loadProject = (project: ProjectEntry) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProjectTitle(project.title.replace(/ /g, '_'));

    const newTracks: StemTrack[] = [];

    if (project.audio_urls.karaoke || project.audio_urls.instrumental) {
      const karaokeUrl = project.audio_urls.karaoke || project.audio_urls.instrumental;
      newTracks.push({
        id: `track-inst-${Date.now()}`,
        name: `${project.title} — Instrumental (Karaoke)`,
        type: 'backing',
        color: 'var(--stem-backing)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.85,
        audioUrl: `${BACKEND_URL}${karaokeUrl}`,
        waveformSeed: Math.floor(Math.random() * 200),
      });
    }

    if (project.audio_urls.vocals) {
      newTracks.push({
        id: `track-vox-${Date.now()}`,
        name: `${project.title} — Vocals`,
        type: 'vocals',
        color: 'var(--stem-vocals)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.9,
        audioUrl: `${BACKEND_URL}${project.audio_urls.vocals}`,
        waveformSeed: Math.floor(Math.random() * 200) + 50,
      });
    }

    // If we found stems, replace tracks; otherwise keep existing
    if (newTracks.length > 0) {
      setTracks(newTracks);
      // The duration will auto-update once real audio loads
      setDuration(30);
    }

    if (project.audio_urls.karaoke) {
      setDownloadUrl(`${BACKEND_URL}${project.audio_urls.karaoke}`);
    }

    setLibraryOpen(false);
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
        onLibraryClick={loadLibrary}
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
            onSeek={handleSeek}
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
        onSeekRelative={(delta) => {
          const newTime = Math.max(0, Math.min(duration, currentTime + delta));
          handleSeek(newTime);
        }}
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

      {/* Library Modal */}
      {libraryOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '70vh',
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Library Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={18} color="#0284c7" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Project Library
                </span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 600
                }}>
                  {projects.length} tracks
                </span>
              </div>
              <button onClick={() => setLibraryOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Library Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {loadingProjects ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '40px', gap: '8px', color: 'var(--text-muted)', fontSize: '13px'
                }}>
                  <Loader2 size={16} className="animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '40px', gap: '8px'
                }}>
                  <Disc size={32} color="var(--text-muted)" />
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No separated tracks yet.<br />
                    Import a YouTube link or upload an audio file to get started.
                  </div>
                </div>
              ) : (
                projects.map((project) => {
                  const stemCount = Object.keys(project.stems).length;
                  const date = new Date(project.mtime * 1000);
                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <button
                      key={project.id}
                      onClick={() => loadProject(project)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        marginBottom: '4px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Music size={18} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {project.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>{stemCount} stem{stemCount !== 1 ? 's' : ''}</span>
                          {Object.keys(project.stems).map(st => (
                            <span key={st} style={{
                              fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                              background: st === 'vocals' ? 'rgba(124, 58, 237, 0.1)' :
                                st === 'karaoke' || st === 'instrumental' ? 'rgba(2, 132, 199, 0.1)' :
                                  'rgba(100, 116, 139, 0.1)',
                              color: st === 'vocals' ? '#7c3aed' :
                                st === 'karaoke' || st === 'instrumental' ? '#0284c7' : '#64748b',
                              fontWeight: 600
                            }}>
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
