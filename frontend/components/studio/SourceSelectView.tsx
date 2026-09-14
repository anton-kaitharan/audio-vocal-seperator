'use client';

import React from 'react';
import { Video, UploadCloud, ArrowRight, Sparkles, FolderOpen, Disc, Clock, Music } from 'lucide-react';

interface ProjectEntry {
  id: string;
  title: string;
  mtime: number;
  stems: Record<string, string>;
  audio_urls: Record<string, string>;
}

interface SourceSelectViewProps {
  onSelectYouTube: () => void;
  onSelectUpload: () => void;
  recentProjects?: ProjectEntry[];
  onOpenProject?: (project: ProjectEntry) => void;
  onOpenLibrary?: () => void;
}

export const SourceSelectView: React.FC<SourceSelectViewProps> = ({
  onSelectYouTube,
  onSelectUpload,
  recentProjects = [],
  onOpenProject,
  onOpenLibrary,
}) => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(124, 58, 237, 0.05) 0%, #ffffff 70%)',
      overflowY: 'auto'
    }}>
      {/* Header Tagline */}
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          color: 'var(--accent-purple)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Sparkles size={14} />
          <span>Demucs v4 Neural Separation</span>
        </div>

        <h1 style={{
          fontSize: '34px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.8px',
          lineHeight: 1.2,
          marginBottom: '12px'
        }}>
          Choose your audio source
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          Isolate pristine studio vocals, instrumental backing, drums, and bass stems in seconds.
        </p>
      </div>

      {/* Binary Choice: Two Large Tappable Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 340px))',
        gap: '24px',
        width: '100%',
        maxWidth: '720px',
        marginBottom: '40px'
      }}>
        {/* Card 1: YouTube */}
        <button
          onClick={onSelectYouTube}
          style={{
            position: 'relative',
            background: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            border: '1px solid #fca5a5'
          }}>
            <Video size={26} color="#ef4444" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color: '#ef4444',
            marginBottom: '6px'
          }}>
            Streaming Link
          </div>

          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            YouTube Link
          </h2>

          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '24px',
            flex: 1
          }}>
            Paste any YouTube video or song URL. We automatically fetch the title and isolate the stems.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>
              Paste URL & proceed
            </span>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowRight size={14} color="#ef4444" />
            </div>
          </div>
        </button>

        {/* Card 2: Direct Upload */}
        <button
          onClick={onSelectUpload}
          style={{
            position: 'relative',
            background: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '32px 26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-purple)';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            border: '1px solid #c4b5fd'
          }}>
            <UploadCloud size={26} color="var(--accent-purple)" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color: 'var(--accent-purple)',
            marginBottom: '6px'
          }}>
            Local Audio
          </div>

          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Upload Audio File
          </h2>

          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '24px',
            flex: 1
          }}>
            Upload files directly from your computer. Supports MP3, WAV, FLAC, M4A, OGG up to 100MB.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-purple)' }}>
              Drag & drop file
            </span>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowRight size={14} color="var(--accent-purple)" />
            </div>
          </div>
        </button>
      </div>

      {/* Quick Access: Recent Stems Shelf */}
      {recentProjects.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Clock size={14} />
              <span>Recently Separated Songs</span>
            </div>
            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FolderOpen size={13} />
                <span>View Library</span>
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {recentProjects.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => onOpenProject?.(p)}
                style={{
                  flex: '0 0 auto',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-purple)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
              >
                <Disc size={14} color="var(--accent-purple)" />
                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </span>
                <span style={{
                  fontSize: '10px',
                  background: 'rgba(124, 58, 237, 0.08)',
                  color: 'var(--accent-purple)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {Object.keys(p.stems || {}).length} stems
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
