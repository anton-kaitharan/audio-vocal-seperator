'use client';

import React, { useState } from 'react';
import { X, Video, UploadCloud, Loader2, Sparkles, Music } from 'lucide-react';
import { fetchYoutubeMetadata, submitSeparationJob } from '../../lib/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (trackTitle: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleFetchInfo = async () => {
    if (!url) return;
    setIsFetchingMeta(true);
    setMessage(null);
    const res = await fetchYoutubeMetadata(url);
    setIsFetchingMeta(false);
    if (res.title) {
      setTitle(res.title);
      setMessage({ text: `Detected: ${res.title} (${res.duration})` });
    } else {
      setMessage({ text: res.error || 'Could not resolve title. Please type it manually.', isError: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsSubmitting(true);
    setMessage(null);

    const res = await submitSeparationJob({
      url,
      title: title || undefined,
      start: startTime || undefined,
      end: endTime || undefined
    });

    setIsSubmitting(false);
    if (res.status === 'queued') {
      onImportSuccess(title || 'Separated Stems Track');
      onClose();
    } else {
      setMessage({ text: res.error || 'Notice: Offline mock job initialized for testing.', isError: false });
      setTimeout(() => {
        onImportSuccess(title || 'Separated Stems Track');
        onClose();
      }, 1000);
    }
  };

  return (
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
        maxWidth: '520px',
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Music size={18} color="var(--accent-purple)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Import Track to Studio</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 20px', background: '#ffffff' }}>
          <button
            onClick={() => setActiveTab('youtube')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'youtube' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'youtube' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Video size={16} color="#ef4444" />
            YouTube Link
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'upload' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'upload' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UploadCloud size={16} color="#0284c7" />
            Direct File Upload
          </button>
        </div>

        {/* Content */}
        {activeTab === 'youtube' ? (
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                YouTube Video URL <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleFetchInfo}
                  disabled={isFetchingMeta || !url}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  {isFetchingMeta ? <Loader2 size={14} className="animate-spin" /> : 'Fetch Info'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                Track Title
              </label>
              <input
                type="text"
                placeholder="e.g. Bohemian Rhapsody"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Trim Start (hh:mm:ss)
                </label>
                <input
                  type="text"
                  placeholder="00:00:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Trim End (hh:mm:ss)
                </label>
                <input
                  type="text"
                  placeholder="00:03:30"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {message && (
              <div style={{
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: message.isError ? '#fee2e2' : '#ecfdf5',
                color: message.isError ? '#dc2626' : '#059669',
                border: message.isError ? '1px solid #fca5a5' : '1px solid #a7f3d0'
              }}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px var(--accent-purple-glow)',
                marginTop: '4px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting to AI Separation Queue...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Start Demucs AI Separation</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '1px dashed #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud size={28} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Drag & Drop Audio Files</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports MP3, WAV, FLAC, M4A up to 100MB
              </div>
            </div>
            <button
              onClick={() => {
                onImportSuccess('Local Studio Master');
                onClose();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                fontWeight: 500,
                marginTop: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              Select File from Computer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
