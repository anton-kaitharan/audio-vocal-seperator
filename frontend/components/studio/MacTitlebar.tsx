'use client';

import React from 'react';
import Link from 'next/link';
import { Download, PlusCircle, Activity, Sliders } from 'lucide-react';

interface MacTitlebarProps {
  projectTitle: string;
  onImportClick: () => void;
  onExportClick: () => void;
  activeRoute?: 'studio' | 'test' | 'landing';
}

export const MacTitlebar: React.FC<MacTitlebarProps> = ({
  projectTitle,
  onImportClick,
  onExportClick,
  activeRoute = 'studio'
}) => {
  return (
    <header style={{
      height: '46px',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
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
            color: activeRoute === 'landing' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeRoute === 'landing' ? 'var(--bg-card-hover)' : 'transparent',
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
            color: activeRoute === 'studio' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            background: activeRoute === 'studio' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sliders size={13} color="var(--accent-purple)" />
            Studio
          </Link>
          <Link href="/test" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            color: activeRoute === 'test' ? '#059669' : '#10b981',
            background: activeRoute === 'test' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            border: activeRoute === 'test' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
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
        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px', color: 'var(--text-primary)' }}>
          {projectTitle || 'Untitled Project'}
        </span>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          padding: '2px 7px',
          borderRadius: '4px',
          background: 'rgba(124, 58, 237, 0.08)',
          color: 'var(--accent-purple)',
          border: '1px solid rgba(124, 58, 237, 0.25)'
        }}>
          44.1kHz • 16-bit Master
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onImportClick}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: '#ffffff',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-purple)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        >
          <PlusCircle size={14} color="var(--accent-purple)" />
          <span>Import Track</span>
        </button>

        <button
          onClick={onExportClick}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
          }}
        >
          <Download size={14} />
          <span>Export Master</span>
        </button>
      </div>
    </header>
  );
};
