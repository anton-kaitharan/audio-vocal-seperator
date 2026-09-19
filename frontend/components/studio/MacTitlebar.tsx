'use client';

import React from 'react';
import Link from 'next/link';
import { Download, PlusCircle, Activity, Sliders, FolderOpen } from 'lucide-react';

interface MacTitlebarProps {
  projectTitle: string;
  onImportClick: () => void;
  onExportClick: () => void;
  onLibraryClick?: () => void;
  activeRoute?: 'studio' | 'test' | 'landing';
  viewMode?: string;
  onToggleViewMode?: () => void;
  onNewProject?: () => void;
}

export const MacTitlebar: React.FC<MacTitlebarProps> = ({
  projectTitle,
  onImportClick,
  onExportClick,
  onLibraryClick,
  activeRoute = 'studio',
  viewMode,
  onToggleViewMode,
  onNewProject
}) => {
  return (
    <header style={{
      height: '46px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      userSelect: 'none',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Mac OS Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
          <Link href="/" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            color: activeRoute === 'landing' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            background: activeRoute === 'landing' ? 'var(--color-surface-elevated)' : 'transparent',
            transition: 'all 0.15s'
          }}>
            Home
          </Link>
          <Link href="/studio" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            color: activeRoute === 'studio' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: activeRoute === 'studio' ? 'rgba(185, 240, 59, 0.12)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sliders size={13} color="var(--color-primary)" />
            Studio
          </Link>
          <Link href="/test" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            color: activeRoute === 'test' ? '#10b981' : 'var(--color-text-secondary)',
            background: activeRoute === 'test' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: activeRoute === 'test' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Activity size={13} />
            Test Router
          </Link>
        </div>
      </div>

      {/* Center Project Name & Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px', color: 'var(--color-text-primary)' }}>
          {projectTitle || 'Untitled Project'}
        </span>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          padding: '2px 7px',
          borderRadius: '4px',
          background: 'rgba(185, 240, 59, 0.12)',
          color: 'var(--color-primary)',
          border: '1px solid rgba(185, 240, 59, 0.3)'
        }}>
          44.1kHz • 16-bit Master
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: viewMode === 'advanced_studio' ? 'rgba(185, 240, 59, 0.15)' : 'var(--color-surface-elevated)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(185, 240, 59, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            title={viewMode === 'advanced_studio' ? 'Return to Stem Mixer' : 'Switch to full DAW'}
          >
            <Sliders size={13} />
            <span>{viewMode === 'advanced_studio' ? 'Simple Mixer' : 'Advanced Studio'}</span>
          </button>
        )}

        {onLibraryClick && (
          <button
            onClick={onLibraryClick}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <FolderOpen size={14} color="var(--color-primary)" />
            <span>Library</span>
          </button>
        )}
        <button
          onClick={onImportClick}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <PlusCircle size={14} color="var(--color-primary)" />
          <span>Import Track</span>
        </button>

        <button
          onClick={onExportClick}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
            color: '#0E0E0E',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(185, 240, 59, 0.3)'
          }}
        >
          <Download size={14} />
          <span>Export Master</span>
        </button>
      </div>
    </header>
  );
};
