'use client';

import React, { useState } from 'react';
import { X, Download, FileAudio, Archive, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, projectTitle }) => {
  const [format, setFormat] = useState<'wav' | 'mp3' | 'zip'>('wav');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    const element = document.createElement('a');
    element.href = `http://localhost:5000/api/files`;
    element.setAttribute('download', `${projectTitle}_master.${format}`);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
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
        maxWidth: '460px',
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
            <Download size={18} color="var(--accent-purple)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Export Audio Master</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Choose export format for <strong style={{ color: 'var(--text-primary)' }}>{projectTitle}</strong>:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* WAV */}
            <div
              onClick={() => setFormat('wav')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '8px',
                background: format === 'wav' ? 'rgba(124, 58, 237, 0.08)' : '#f8fafc',
                border: format === 'wav' ? '1px solid var(--accent-purple)' : '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileAudio size={20} color="var(--accent-purple)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Master WAV (Lossless)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>44.1kHz • 16-bit PCM • Broadcast Normalized</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>~45 MB</span>
            </div>

            {/* MP3 */}
            <div
              onClick={() => setFormat('mp3')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '8px',
                background: format === 'mp3' ? 'rgba(124, 58, 237, 0.08)' : '#f8fafc',
                border: format === 'mp3' ? '1px solid var(--accent-purple)' : '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileAudio size={20} color="#0284c7" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>High Quality MP3</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>320 kbps CBR • Web & Mobile Friendly</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>~7 MB</span>
            </div>

            {/* All Stems ZIP */}
            <div
              onClick={() => setFormat('zip')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '8px',
                background: format === 'zip' ? 'rgba(124, 58, 237, 0.08)' : '#f8fafc',
                border: format === 'zip' ? '1px solid var(--accent-purple)' : '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Archive size={20} color="#ea580c" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Full Stems Bundle (.ZIP)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vocals, Backing, Drums, Bass WAVs</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>~140 MB</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
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
              marginTop: '8px'
            }}
          >
            {downloaded ? (
              <>
                <Check size={16} />
                <span>Download Started!</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download {format.toUpperCase()} Package</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
