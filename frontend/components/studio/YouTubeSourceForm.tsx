'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  Sparkles,
  Loader2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchYoutubeMetadata, submitSeparationJob } from '../../lib/api';

interface YouTubeSourceFormProps {
  onBack: () => void;
  onSubmitJob: (jobInfo: {
    jobName: string;
    title: string;
    downloadUrl?: string;
  }) => void;
}

const PRESET_SAMPLES = [
  { label: 'Synthwave Beat', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'Lo-Fi Chill Track', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' }
];

export const YouTubeSourceForm: React.FC<YouTubeSourceFormProps> = ({
  onBack,
  onSubmitJob
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [stemMode, setStemMode] = useState<'2-stem' | '4-stem'>('2-stem');
  const [trimOpen, setTrimOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hasRightsAgreed, setHasRightsAgreed] = useState(false);

  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (selectedUrl: string) => {
    setUrl(selectedUrl);
    setErrorMsg(null);
  };

  // Extract YouTube ID on URL change
  useEffect(() => {
    if (!url.trim()) {
      setVideoId(null);
      return;
    }
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) {
      setVideoId(match[1]);
      // Auto-fetch metadata if we haven't yet or URL changed
      const fetchMeta = async () => {
        setIsFetchingMeta(true);
        setErrorMsg(null);
        const res = await fetchYoutubeMetadata(url);
        setIsFetchingMeta(false);
        if (res.title) {
          setTitle(res.title);
          setDuration(res.duration || '');
        }
      };
      fetchMeta();
    } else {
      setVideoId(null);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!hasRightsAgreed) {
      setErrorMsg('Please confirm you have the rights to process this audio content.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const effectiveTitle = title.trim() || 'YouTube Audio Track';

    const res = await submitSeparationJob({
      url: url.trim(),
      title: effectiveTitle,
      start: startTime.trim() || undefined,
      end: endTime.trim() || undefined
    });

    setIsSubmitting(false);

    if (res.status === 'completed' || res.status === 'queued') {
      const jobFilename = res.filename || `${effectiveTitle.replace(/\s+/g, '_')}.txt`;
      onSubmitJob({
        jobName: jobFilename,
        title: effectiveTitle,
        downloadUrl: res.download_url
      });
    } else {
      setErrorMsg(res.error || 'Failed to submit job. Please check the URL and try again.');
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(239, 68, 68, 0.05) 0%, var(--color-bg-main) 70%)',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden'
      }}>
        {/* Top Bar with Back Button */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface-elevated)'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              transition: 'color 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <ArrowLeft size={16} />
            <span>Back to sources</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.15)',
            padding: '4px 10px',
            borderRadius: '9999px'
          }}>
            <Video size={14} />
            <span>YouTube Pipeline</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              YouTube URL <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: errorMsg ? '1px solid #ef4444' : '1px solid var(--color-border)',
                  background: 'var(--color-surface-elevated)',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = errorMsg ? '#ef4444' : 'var(--color-border)')}
              />
              <Video size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              {errorMsg && (
                <div style={{ position: 'absolute', right: '12px', top: '12px', color: '#ef4444' }}>
                  <AlertCircle size={18} />
                </div>
              )}
            </div>
            {errorMsg && (
              <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {errorMsg}
              </span>
            )}
          </div>

          {/* Quick Preset Options */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Try sample track:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_SAMPLES.map(sample => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => handleSelectPreset(sample.url)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: url === sample.url ? 'rgba(185, 240, 59, 0.15)' : 'var(--color-surface-elevated)',
                    border: url === sample.url ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    color: url === sample.url ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Video Preview Card (Thumbnail & Title) */}
          {videoId && (
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '12px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              alignItems: 'center'
            }}>
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt="Video thumbnail"
                style={{
                  width: '100px',
                  height: '62px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  background: 'var(--color-border)',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  value={title}
                  placeholder="Song Title"
                  onChange={e => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: 0,
                    marginBottom: '4px'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {duration && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {duration}
                    </span>
                  )}
                  <span>ID: {videoId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stem Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Separation Profile
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStemMode('2-stem')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: stemMode === '2-stem' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: stemMode === '2-stem' ? 'rgba(185, 240, 59, 0.12)' : 'var(--color-surface-elevated)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: stemMode === '2-stem' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    2-Stem (Standard)
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(185, 240, 59, 0.2)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                    Fast
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Lead Vocals + Instrumental
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStemMode('4-stem')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: stemMode === '4-stem' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: stemMode === '4-stem' ? 'rgba(185, 240, 59, 0.12)' : 'var(--color-surface-elevated)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: stemMode === '4-stem' ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    4-Stem (Pro)
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px' }}>
                    Full Studio
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Vocals, Drums, Bass, Other
                </div>
              </button>
            </div>
          </div>

          {/* Collapsible Trim (Optional) */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setTrimOpen(!trimOpen)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--color-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>Trim specific audio segment (Optional)</span>
              </div>
              {trimOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {trimOpen && (
              <div style={{ padding: '14px', background: 'var(--color-surface)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Start (hh:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="00:00:00"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    End (hh:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="00:03:30"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Legal Rights Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)'
          }}>
            <input
              type="checkbox"
              id="legal-rights"
              checked={hasRightsAgreed}
              onChange={e => setHasRightsAgreed(e.target.checked)}
              style={{ marginTop: '2.5px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="legal-rights" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Rights Confirmation:</span> I confirm that I hold the copyright, license, or explicit permission to download, separate, and master this audio.
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertCircle size={15} flex-shrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting || !url.trim() || !hasRightsAgreed}
            style={{
              background: hasRightsAgreed && url.trim()
                ? 'linear-gradient(135deg, var(--color-primary), #90cb18)'
                : 'var(--color-border)',
              color: hasRightsAgreed && url.trim() ? '#0E0E0E' : 'var(--color-text-secondary)',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: hasRightsAgreed && url.trim() ? '0 4px 14px rgba(185, 240, 59, 0.3)' : 'none',
              cursor: hasRightsAgreed && url.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting to AI Separation Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start AI Separation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
