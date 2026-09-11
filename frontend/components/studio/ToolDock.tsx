'use client';

import React from 'react';
import { MousePointer, ZoomIn, MessageSquare, Mic, Music, Disc } from 'lucide-react';

interface ToolDockProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
}

export const ToolDock: React.FC<ToolDockProps> = ({ activeTool, onSelectTool }) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Selection Tool (V)' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom & Scrub (Z)' },
    { id: 'comment', icon: MessageSquare, label: 'Markers & Comments (C)' },
    { id: 'mic', icon: Mic, label: 'Record & Vocal Ingest (R)' },
    { id: 'stems', icon: Music, label: 'Stem Library (S)' },
  ];

  return (
    <aside style={{
      width: '56px',
      height: '100%',
      background: 'var(--bg-darkest)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: '16px',
      userSelect: 'none',
      zIndex: 30
    }}>
      {/* App Logo Symbol matching screenshot */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }} title="AuraVocal Studio">
        <Disc size={20} color="#fff" />
      </div>

      {/* Tool Icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              title={t.label}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'var(--accent-purple)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 12px var(--accent-purple-glow)' : 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={19} />
            </button>
          );
        })}
      </div>
    </aside>
  );
};
