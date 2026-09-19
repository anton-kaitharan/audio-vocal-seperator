'use client';

import React, { useState } from 'react';
import { Clock, Sliders, ChevronDown, FolderArchive, Layers } from 'lucide-react';
import { InspectorState } from '../../types/studio';

interface InspectorPanelProps {
  inspector: InspectorState;
  onChange: (updated: Partial<InspectorState>) => void;
  onApplyEffect: (effectName: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  inspector,
  onChange,
  onApplyEffect,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'assets'>('properties');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyClick = () => {
    setIsApplying(true);
    onApplyEffect(inspector.selectedEffect);
    setTimeout(() => setIsApplying(false), 600);
  };

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      overflowY: 'auto',
      zIndex: 30
    }}>
      {/* Tab Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        height: '46px',
        alignItems: 'center',
        gap: '20px',
        background: 'var(--color-surface-elevated)'
      }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'properties' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'properties' ? '2px solid var(--color-primary)' : '2px solid transparent',
            padding: '0 4px',
            transition: 'all 0.15s'
          }}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 500,
            color: activeTab === 'assets' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'assets' ? '2px solid var(--color-primary)' : '2px solid transparent',
            padding: '0 4px',
            transition: 'all 0.15s'
          }}
        >
          Assets
        </button>
      </div>

      {activeTab === 'properties' ? (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* SECTION: FADE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              fontWeight: 700
            }}>
              <span>▴ Fade</span>
            </div>

            {/* Type & Bezier Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={inspector.fadeType}
                    onChange={(e) => onChange({ fadeType: e.target.value as any })}
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '7px 24px 7px 10px',
                      fontSize: '12px',
                      color: 'var(--color-text-primary)',
                      appearance: 'none',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="linear">Linear</option>
                    <option value="logarithmic">Logarithmic</option>
                    <option value="exponential">Exponential</option>
                  </select>
                </div>
              </div>

              {/* Bezier Graphic Envelope Viewport */}
              <div style={{
                width: '100%',
                height: '95px',
                background: 'var(--color-bg-main)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Amplitude Scale Numbers */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', left: '8px', top: '6px', bottom: '6px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>
                  <span>1000</span>
                  <span>750</span>
                  <span>500</span>
                  <span>250</span>
                  <span>0</span>
                </div>

                {/* Interactive Curve SVG */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                  {/* Horizontal Guide Lines */}
                  <line x1="38" y1="20" x2="100%" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="38" y1="47" x2="100%" y2="47" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="38" y1="75" x2="100%" y2="75" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3,3" />

                  {/* S-Curve Path */}
                  <path
                    d="M 40 75 C 110 75, 170 30, 280 20"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                  />
                  {/* Keyframe Nodes */}
                  <circle cx="40" cy="75" r="4" fill="var(--color-bg-main)" stroke="var(--color-primary)" strokeWidth="2" />
                  <circle cx="280" cy="20" r="4" fill="var(--color-bg-main)" stroke="var(--color-primary)" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

            {/* SECTION: EFFECTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
                fontWeight: 700
              }}>
                <span>▴ Effects</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select
                    value={inspector.selectedEffect}
                    onChange={(e) => onChange({ selectedEffect: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '8px 26px 8px 10px',
                      fontSize: '12px',
                      color: 'var(--color-text-primary)',
                      appearance: 'none',
                      outline: 'none'
                    }}
                  >
                    <option value="Reverse audio">Reverse audio</option>
                    <option value="Demucs Vocal Separator">Demucs Vocal Separator</option>
                    <option value="Vocal Isolator (Acapella)">Vocal Isolator (Acapella)</option>
                    <option value="De-Reverb Cleaner">De-Reverb Cleaner</option>
                    <option value="Bass & Low-End Boost">Bass & Low-End Boost</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '10px', pointerEvents: 'none', color: 'var(--color-text-secondary)' }} />
                </div>

                <button
                  onClick={handleApplyClick}
                  disabled={isApplying}
                  style={{
                    background: isApplying ? 'var(--color-surface-elevated)' : 'linear-gradient(135deg, var(--color-primary), #90cb18)',
                    color: isApplying ? 'var(--color-text-secondary)' : '#0E0E0E',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: isApplying ? 'none' : '0 2px 8px rgba(185, 240, 59, 0.3)',
                    transition: 'all 0.15s ease',
                    cursor: isApplying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>

          {/* SECTION: PLAYBACK SPEED */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span>▴ Playback Speed</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="0.5"
                  value={inspector.playbackSpeed}
                  onChange={(e) => onChange({ playbackSpeed: parseFloat(e.target.value) })}
                />
              </div>
              <span style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                minWidth: '60px',
                textAlign: 'right',
                fontWeight: 600
              }}>
                {inspector.playbackSpeed.toFixed(2)} %
              </span>
            </div>
          </div>

          {/* SECTION: PITCH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span>▴ Pitch</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={16} color="var(--text-muted)" />
              <div style={{ flex: 1 }}>
                <input
                  type="range"
                  min="400"
                  max="480"
                  step="0.1"
                  value={inspector.pitchShiftHz}
                  onChange={(e) => onChange({ pitchShiftHz: parseFloat(e.target.value) })}
                />
              </div>
              <span style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                minWidth: '68px',
                textAlign: 'right',
                fontWeight: 600
              }}>
                {inspector.pitchShiftHz.toFixed(2)} Hz
              </span>
            </div>
          </div>

          {/* SECTION: REVERB */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span>▴ Reverb</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Delay ({inspector.reverbDelay}ms)
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={inspector.reverbDelay}
                  onChange={(e) => onChange({ reverbDelay: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Decay ({inspector.reverbDecay}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={inspector.reverbDecay}
                  onChange={(e) => onChange({ reverbDecay: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ASSETS TAB */
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            PROJECT ASSETS & STEM PACKS
          </div>

          <div style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <Layers size={20} color="var(--color-primary)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Demucs 4-Stem Model</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>htdemucs • 80 MB AI Cache</div>
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <FolderArchive size={20} color="#ea580c" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Master Audio Output</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>44.1kHz Stereo PCM WAV</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
