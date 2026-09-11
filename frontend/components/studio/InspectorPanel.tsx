'use client';

import React, { useState } from 'react';
import { Clock, Sliders, ChevronDown, Wand2, Sparkles, FolderArchive, Layers } from 'lucide-react';
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
      width: '310px',
      height: '100%',
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      overflowY: 'auto',
      zIndex: 20
    }}>
      {/* Tabs: Properties vs Assets */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 16px',
        height: '46px',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'properties' ? '#ffffff' : 'var(--text-secondary)',
            borderBottom: activeTab === 'properties' ? '2px solid var(--accent-purple)' : '2px solid transparent',
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
            color: activeTab === 'assets' ? '#ffffff' : 'var(--text-secondary)',
            borderBottom: activeTab === 'assets' ? '2px solid var(--accent-purple)' : '2px solid transparent',
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
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              <span>▴ Fade</span>
            </div>

            {/* Type & Bezier Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={inspector.fadeType}
                    onChange={(e) => onChange({ fadeType: e.target.value as any })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      padding: '7px 24px 7px 10px',
                      fontSize: '12px',
                      color: '#fff',
                      appearance: 'none',
                      outline: 'none'
                    }}
                  >
                    <option value="none">None</option>
                    <option value="linear">Linear</option>
                    <option value="bezier">Bezier</option>
                    <option value="exponential">Exponential</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '9px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Bezier
                </label>
                <input
                  type="text"
                  value={inspector.bezierParams}
                  onChange={(e) => onChange({ bezierParams: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Bezier Graphic Envelope Viewport */}
            <div style={{
              width: '100%',
              height: '95px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Amplitude Scale Numbers */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', left: '8px', top: '6px', bottom: '6px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', pointerEvents: 'none' }}>
                <span>1000</span>
                <span>750</span>
                <span>500</span>
                <span>250</span>
                <span>0</span>
              </div>

              {/* Interactive Curve SVG */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id="fadeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="38" y1="20" x2="100%" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,2" />
                <line x1="38" y1="47" x2="100%" y2="47" stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                <line x1="38" y1="75" x2="100%" y2="75" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,2" />

                {/* S-Curve Path matching screenshot */}
                <path
                  d="M 40 75 C 110 75, 170 30, 280 20"
                  fill="none"
                  stroke="var(--accent-purple)"
                  strokeWidth="2.5"
                />
                {/* Keyframe Nodes */}
                <circle cx="40" cy="75" r="3.5" fill="#fff" stroke="var(--accent-purple)" strokeWidth="1.5" />
                <circle cx="280" cy="20" r="3.5" fill="#fff" stroke="var(--accent-purple)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* SECTION: EFFECTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
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
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '8px 26px 8px 10px',
                    fontSize: '12px',
                    color: '#fff',
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
                <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>

              <button
                onClick={handleApplyClick}
                disabled={isApplying}
                style={{
                  background: isApplying ? '#6d28d9' : 'var(--accent-purple)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '0 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  boxShadow: '0 2px 10px var(--accent-purple-glow)',
                  transition: 'all 0.15s ease'
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
                color: '#fff',
                minWidth: '60px',
                textAlign: 'right'
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
                color: '#fff',
                minWidth: '68px',
                textAlign: 'right'
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
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            PROJECT ASSETS & STEM PACKS
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Layers size={20} color="var(--accent-purple)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Demucs 4-Stem Model</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>htdemucs • 80 MB AI Cache</div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FolderArchive size={20} color="#f97316" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Master Audio Output</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>44.1kHz Stereo PCM WAV</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
