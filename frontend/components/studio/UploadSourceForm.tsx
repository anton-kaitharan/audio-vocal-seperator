'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  FileAudio,
  Sparkles,
  Loader2,
  X,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { uploadAudioFile } from '../../lib/api';

interface UploadSourceFormProps {
  onBack: () => void;
  onSubmitJob: (jobInfo: {
    jobName: string;
    title: string;
  }) => void;
}

export const UploadSourceForm: React.FC<UploadSourceFormProps> = ({
  onBack,
  onSubmitJob
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [stemMode, setStemMode] = useState<'2-stem' | '4-stem'>('2-stem');
  const [trimOpen, setTrimOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTS = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.wma'];
  const MAX_MB = 100;

  const handleSelectFile = (selected: File) => {
    const ext = '.' + (selected.name.split('.').pop()?.toLowerCase() || '');
    if (!ALLOWED_EXTS.includes(ext)) {
      setErrorMsg(`Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTS.join(', ')}`);
      return;
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`File is too large (${(selected.size / (1024 * 1024)).toFixed(1)} MB). Limit is ${MAX_MB} MB.`);
      return;
    }

    setFile(selected);
    setErrorMsg(null);
    if (!title.trim()) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleSelectFile(dropped);
  }, [title]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select an audio file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const effectiveTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');

    const res = await uploadAudioFile(
      file,
      effectiveTitle,
      startTime.trim() || undefined,
      endTime.trim() || undefined
    );

    setIsUploading(false);

    if (res.status === 'queued' || res.status === 'completed') {
      const jobFilename = res.filename || `${effectiveTitle.replace(/\s+/g, '_')}.txt`;
      onSubmitJob({
        jobName: jobFilename,
        title: effectiveTitle
      });
    } else {
      setErrorMsg(res.error || 'Failed to upload audio file. Please try again.');
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
      background: 'radial-gradient(ellipse at 50% 10%, rgba(124, 58, 237, 0.05) 0%, #ffffff 70%)',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        {/* Top Bar with Back Button */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafbfc'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
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
            color: 'var(--accent-purple)',
            background: '#ede9fe',
            padding: '4px 10px',
            borderRadius: '9999px'
          }}>
            <UploadCloud size={14} />
            <span>Direct Audio Ingestion</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Upload Audio Track
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Provide your local audio recording to extract stems with AI precision.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.flac,.m4a,.ogg,.aac,.wma"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleSelectFile(f);
            }}
          />

          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{
              border: isDragOver
                ? '2px solid var(--accent-purple)'
                : file
                  ? '2px solid #22c55e'
                  : '2px dashed var(--border-light)',
              borderRadius: '12px',
              padding: file ? '16px 20px' : '36px 20px',
              textAlign: 'center',
              cursor: file ? 'default' : 'pointer',
              background: isDragOver
                ? 'rgba(124, 58, 237, 0.04)'
                : file
                  ? '#f0fdf4'
                  : '#fafbfc',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: file ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: file ? 'flex-start' : 'center',
              gap: file ? '14px' : '10px'
            }}
          >
            {file ? (
              <>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileAudio size={22} color="#fff" />
                </div>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI model
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setErrorMsg(null);
                  }}
                  style={{
                    color: 'var(--text-muted)',
                    padding: '6px',
                    borderRadius: '6px',
                    background: '#e2e8f0'
                  }}
                  title="Remove file"
                >
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: isDragOver ? 'rgba(124, 58, 237, 0.1)' : '#ede9fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <UploadCloud size={28} color="var(--accent-purple)" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isDragOver ? 'Drop file to upload' : 'Click or drag & drop audio here'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports MP3, WAV, FLAC, M4A, OGG • Max {MAX_MB}MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  Browse Computer
                </button>
              </>
            )}
          </div>

          {/* Track Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Acoustic Session Stems"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1.5px solid var(--border-light)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13.5px',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-purple)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
            />
          </div>

          {/* Stem Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Separation Profile
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStemMode('2-stem')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: stemMode === '2-stem' ? '2px solid var(--accent-purple)' : '1px solid var(--border-light)',
                  background: stemMode === '2-stem' ? 'rgba(124, 58, 237, 0.05)' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: stemMode === '2-stem' ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                    2-Stem (Standard)
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#ede9fe', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '4px' }}>
                    Fast
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Lead Vocals + Instrumental
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStemMode('4-stem')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: stemMode === '4-stem' ? '2px solid var(--accent-purple)' : '1px solid var(--border-light)',
                  background: stemMode === '4-stem' ? 'rgba(124, 58, 237, 0.05)' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: stemMode === '4-stem' ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                    4-Stem (Pro)
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>
                    Full Studio
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Vocals, Drums, Bass, Other
                </div>
              </button>
            </div>
          </div>

          {/* Collapsible Trim (Optional) */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setTrimOpen(!trimOpen)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#fafbfc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
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
              <div style={{ padding: '14px', background: '#ffffff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Start (hh:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="00:00:00"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    End (hh:mm:ss)
                  </label>
                  <input
                    type="text"
                    placeholder="00:03:30"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#dc2626',
              fontSize: '12px',
              border: '1px solid #fca5a5'
            }}>
              <AlertCircle size={15} flex-shrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isUploading || !file}
            style={{
              background: file
                ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                : '#cbd5e1',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: file ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
              cursor: file ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading & Starting AI Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Upload & Start AI Separation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
