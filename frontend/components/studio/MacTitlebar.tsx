'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, PlusCircle, Activity, Sliders, FolderOpen, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

      {/* Right Actions & User Auth Menu */}
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

        {/* User Auth Profile Badge */}
        <div style={{ position: 'relative', marginLeft: '6px' }}>
          {isAuthenticated && user ? (
            <div>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#0E0E0E',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {user.username}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '38px',
                    width: '200px',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {user.username}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
