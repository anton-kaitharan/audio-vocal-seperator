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
import { SourceSelectView } from '../../components/studio/SourceSelectView';
import { YouTubeSourceForm } from '../../components/studio/YouTubeSourceForm';
import { UploadSourceForm } from '../../components/studio/UploadSourceForm';
import { ProcessingView } from '../../components/studio/ProcessingView';
import { StemMixerView } from '../../components/studio/StemMixerView';
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

export type StudioViewMode =
  | 'source_select'
  | 'form_youtube'
  | 'form_upload'
  | 'processing'
  | 'stem_mixer'
  | 'advanced_studio';

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
  const [viewMode, setViewMode] = useState<StudioViewMode>('source_select');
  const [currentJob, setCurrentJob] = useState<{ jobName: string; title: string } | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('New Project');
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

  // Inspector State for DAW view
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

  // Stems Tracks (initialized empty for clean first-visit experience)
  const [tracks, setTracks] = useState<StemTrack[]>([]);

  // Initial load of existing projects for quick-shelf
  useEffect(() => {
    fetchProjectsList()
      .then(res => {
        if (res.projects) {
          setProjects(res.projects);
        }
      })
      .catch(() => {});
  }, []);

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
          const realDur = getRealDuration();
          if (realDur && Math.abs(realDur - duration) > 1) {
            setDuration(realDur);
          }
        } else {
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
    const duplicated: StemTrack = {
      ...orig,
      id: `track-${Date.now()}`,
      name: `${orig.name} (Copy)`,
      waveformSeed: orig.waveformSeed + 13
    };
    setTracks([...tracks, duplicated]);
  };

  const handleExportTrack = (id: string) => {
    const t = tracks.find(trk => trk.id === id);
    if (!t) return;
    if (t.audioUrl) {
      const a = document.createElement('a');
      a.href = t.audioUrl;
      a.download = `${projectTitle}_${t.name}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setExportOpen(true);
    }
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleInspectorChange = (patch: Partial<InspectorState>) => {
    setInspector(prev => ({ ...prev, ...patch }));
  };

  const handleApplyEffect = () => {
    // Subtle effect indicator
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    seekAll(time);
  };

  // Library: load projects list from server
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
    const cleanTitle = project.title.replace(/ /g, '_');
    setProjectTitle(cleanTitle);
    setCurrentProjectId(project.id);

    const newTracks: StemTrack[] = [];

    if (project.audio_urls.vocals) {
      const vUrl = project.audio_urls.vocals.startsWith('http') ? project.audio_urls.vocals : `${BACKEND_URL}${project.audio_urls.vocals}`;
      newTracks.push({
        id: `track-vox-${Date.now()}`,
        name: 'Lead Vocals',
        type: 'vocals',
        color: 'var(--stem-vocals)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.95,
        audioUrl: vUrl,
        waveformSeed: 42,
      });
    }

    if (project.audio_urls.karaoke || project.audio_urls.instrumental) {
      const kUrl = project.audio_urls.karaoke || project.audio_urls.instrumental;
      const fullKUrl = kUrl.startsWith('http') ? kUrl : `${BACKEND_URL}${kUrl}`;
      newTracks.push({
        id: `track-inst-${Date.now()}`,
        name: 'Instrumental / Backing',
        type: 'backing',
        color: 'var(--stem-backing)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.85,
        audioUrl: fullKUrl,
        waveformSeed: 88,
      });
    }

    if (project.audio_urls.drums) {
      const dUrl = project.audio_urls.drums.startsWith('http') ? project.audio_urls.drums : `${BACKEND_URL}${project.audio_urls.drums}`;
      newTracks.push({
        id: `track-drums-${Date.now()}`,
        name: 'Drums',
        type: 'drums',
        color: 'var(--stem-drums)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.85,
        audioUrl: dUrl,
        waveformSeed: 19,
      });
    }

    if (project.audio_urls.bass) {
      const bUrl = project.audio_urls.bass.startsWith('http') ? project.audio_urls.bass : `${BACKEND_URL}${project.audio_urls.bass}`;
      newTracks.push({
        id: `track-bass-${Date.now()}`,
        name: 'Bass',
        type: 'bass',
        color: 'var(--stem-bass)',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.8,
        audioUrl: bUrl,
        waveformSeed: 104,
      });
    }

    if (project.audio_urls.other) {
      const oUrl = project.audio_urls.other.startsWith('http') ? project.audio_urls.other : `${BACKEND_URL}${project.audio_urls.other}`;
      newTracks.push({
        id: `track-other-${Date.now()}`,
        name: 'Other Accompaniment',
        type: 'other',
        color: '#059669',
        muted: false,
        soloed: false,
        locked: false,
        volume: 0.8,
        audioUrl: oUrl,
        waveformSeed: 63,
      });
    }

    if (newTracks.length > 0) {
      setTracks(newTracks);
      setDuration(30);
    }

    if (project.audio_urls.karaoke) {
      setDownloadUrl(`${BACKEND_URL}${project.audio_urls.karaoke}`);
    }

    setLibraryOpen(false);
    setViewMode('stem_mixer');
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
        viewMode={viewMode}
        onToggleViewMode={() => {
          if (viewMode === 'advanced_studio') {
            setViewMode('stem_mixer');
          } else if (viewMode === 'stem_mixer') {
            setViewMode('advanced_studio');
          }
        }}
        onNewProject={() => {
          setIsPlaying(false);
          setViewMode('source_select');
        }}
      />

      {/* 2. Middle Main Workspace Switcher */}
      {viewMode === 'source_select' && (
        <SourceSelectView
          onSelectYouTube={() => setViewMode('form_youtube')}
          onSelectUpload={() => setViewMode('form_upload')}
          recentProjects={projects}
          onOpenProject={loadProject}
          onOpenLibrary={loadLibrary}
        />
      )}

      {viewMode === 'form_youtube' && (
        <YouTubeSourceForm
          onBack={() => setViewMode('source_select')}
          onSubmitJob={({ jobName, title, downloadUrl: dlUrl }) => {
            setCurrentJob({ jobName, title });
            setProjectTitle(title);
            if (dlUrl) setDownloadUrl(dlUrl);
            setViewMode('processing');
          }}
        />
      )}

      {viewMode === 'form_upload' && (
        <UploadSourceForm
          onBack={() => setViewMode('source_select')}
          onSubmitJob={({ jobName, title }) => {
            setCurrentJob({ jobName, title });
            setProjectTitle(title);
            setViewMode('processing');
          }}
        />
      )}

      {viewMode === 'processing' && (
        <ProcessingView
          jobName={currentJob?.jobName || `${projectTitle}.txt`}
          projectTitle={currentJob?.title || projectTitle}
          onCancel={() => setViewMode('source_select')}
          onComplete={(completedProject) => loadProject(completedProject)}
        />
      )}

      {viewMode === 'stem_mixer' && (
        <StemMixerView
          projectTitle={projectTitle}
          projectId={currentProjectId || projectTitle}
          tracks={tracks}
          duration={duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          masterVolume={volume}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onMasterVolumeChange={setVolume}
          onToggleMute={handleToggleMute}
          onToggleSolo={(id) => setTracks(tracks.map(t => t.id === id ? { ...t, soloed: !t.soloed } : t))}
          onTrackVolumeChange={(id, vol) => setTracks(tracks.map(t => t.id === id ? { ...t, volume: vol } : t))}
          onNewProject={() => {
            setIsPlaying(false);
            setViewMode('source_select');
          }}
          onOpenStudio={() => setViewMode('advanced_studio')}
          onOpenLibrary={loadLibrary}
        />
      )}

      {viewMode === 'advanced_studio' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

          {/* Bottom Transport Bar */}
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
        </div>
      )}

      {/* Modals */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={(trackName, url) => {
          setProjectTitle(trackName.replace(/ /g, '_'));
          if (url) setDownloadUrl(url);
          setCurrentJob({ jobName: `${trackName.replace(/ /g, '_')}.txt`, title: trackName });
          setViewMode('processing');
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => loadProject(p)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: '#fafbfc',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-purple)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Disc size={18} color="var(--accent-purple)" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} />
                              {new Date(p.mtime * 1000).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{Object.keys(p.stems || {}).length} Stems</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 600 }}>
                        Open in Mixer →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
