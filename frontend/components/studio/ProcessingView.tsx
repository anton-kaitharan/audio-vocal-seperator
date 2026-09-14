'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Layers,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { fetchJobLog, fetchJobsList, fetchProjectsList, parseLogProgress, JobProgressInfo } from '../../lib/api';

interface ProjectEntry {
  id: string;
  title: string;
  mtime: number;
  stems: Record<string, string>;
  audio_urls: Record<string, string>;
}

interface ProcessingViewProps {
  jobName: string;
  projectTitle: string;
  onCancel: () => void;
  onComplete: (project: ProjectEntry) => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  jobName,
  projectTitle,
  onCancel,
  onComplete
}) => {
  const [logText, setLogText] = useState<string>('');
  const [progressInfo, setProgressInfo] = useState<JobProgressInfo>({
    stage: 'queued',
    message: 'Connecting to AI worker pipeline...',
    stageIndex: 0,
    percent: 10
  });
  const [logsOpen, setLogsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Poll logs and jobs every 1500ms
  useEffect(() => {
    let isMounted = true;
    let completedTriggered = false;

    const poll = async () => {
      try {
        const [logContent, jobsList, projectsRes] = await Promise.all([
          fetchJobLog(jobName),
          fetchJobsList(),
          fetchProjectsList()
        ]);

        if (!isMounted) return;

        setLogText(logContent);

        // Check if job is in done list or failed list
        const cleanJobName = jobName.replace('.txt', '').replace('.log', '');
        const isDone = jobsList.done?.some((j: any) => j.filename.includes(cleanJobName) || cleanJobName.includes(j.filename.replace('.txt', '')));
        const isFailed = jobsList.failed?.some((j: any) => j.filename.includes(cleanJobName));

        const parsed = parseLogProgress(logContent, isFailed, isDone);
        setProgressInfo(parsed);

        // Auto-scroll logs drawer
        if (logTerminalRef.current) {
          logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
        }

        if ((parsed.stage === 'completed' || isDone) && !completedTriggered) {
          completedTriggered = true;
          setIsCompleted(true);

          // Find project in projects list
          const matchingProject = projectsRes.projects?.find(p =>
            p.id.toLowerCase().includes(cleanJobName.toLowerCase()) ||
            cleanJobName.toLowerCase().includes(p.id.toLowerCase()) ||
            p.title.toLowerCase().includes(projectTitle.toLowerCase())
          ) || projectsRes.projects?.[0];

          setTimeout(() => {
            if (isMounted) {
              if (matchingProject) {
                onComplete(matchingProject);
              } else {
                // Synthesize basic project if exact match wasn't returned yet
                onComplete({
                  id: cleanJobName,
                  title: projectTitle,
                  mtime: Date.now() / 1000,
                  stems: {
                    vocals: `${cleanJobName}_vocals.wav`,
                    karaoke: `${cleanJobName}_karoke.wav`
                  },
                  audio_urls: {
                    vocals: `/api/audio/${cleanJobName}_vocals.wav`,
                    karaoke: `/api/audio/${cleanJobName}_karoke.wav`
                  }
                });
              }
            }
          }, 1200);
        }
      } catch (err) {
        console.error('Error polling processing status:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobName, projectTitle, onComplete]);

  const stages = [
    {
      id: 'download',
      title: '1. Ingest & Prepare Audio',
      desc: 'Acquiring high-bitrate PCM audio stream',
      icon: Download,
      color: '#3b82f6'
    },
    {
      id: 'separate',
      title: '2. Demucs AI Separation',
      desc: 'Isolating vocals & instrumental components',
      icon: Wand2,
      color: '#8b5cf6'
    },
    {
      id: 'master',
      title: '3. Mastering & Normalization',
      desc: 'Broadcast loudness curve & alignment',
      icon: Layers,
      color: '#10b981'
    }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(124, 58, 237, 0.06) 0%, #ffffff 70%)',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.07)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafbfc'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--accent-purple)', marginBottom: '2px' }}>
              Separation Pipeline Active
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {projectTitle}
            </h2>
          </div>

          <button
            onClick={onCancel}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Stages Progression */}
        <div style={{ padding: '30px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {stages.map((stg, idx) => {
              const Icon = stg.icon;
              const isPast = progressInfo.stageIndex > idx || isCompleted;
              const isCurrent = progressInfo.stageIndex === idx && !isCompleted;
              const isPending = progressInfo.stageIndex < idx && !isCompleted;

              return (
                <div
                  key={stg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: isCurrent
                      ? `1.5px solid ${stg.color}`
                      : isPast
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : '1px solid var(--border-subtle)',
                    background: isCurrent
                      ? 'rgba(124, 58, 237, 0.03)'
                      : isPast
                        ? '#f0fdf4'
                        : '#fafbfc',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Step Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isPast
                      ? '#10b981'
                      : isCurrent
                        ? stg.color
                        : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: isCurrent ? `0 0 16px ${stg.color}55` : 'none',
                    transition: 'all 0.25s ease'
                  }}>
                    {isPast ? (
                      <CheckCircle2 size={20} />
                    ) : isCurrent ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  {/* Step Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isCurrent
                          ? 'var(--text-primary)'
                          : isPast
                            ? '#065f46'
                            : 'var(--text-muted)'
                      }}>
                        {stg.title}
                      </span>

                      {isCurrent && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: stg.color,
                          background: '#ede9fe',
                          padding: '2px 8px',
                          borderRadius: '9999px'
                        }}>
                          In Progress {progressInfo.percent ? `• ${Math.round(progressInfo.percent)}%` : ''}
                        </span>
                      )}

                      {isPast && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>
                          Completed
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '12px',
                      color: isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                      lineHeight: 1.4
                    }}>
                      {stg.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Status Banner */}
          <div style={{
            marginTop: '24px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: progressInfo.stage === 'failed'
              ? '#fee2e2'
              : '#f8fafc',
            border: progressInfo.stage === 'failed'
              ? '1px solid #fca5a5'
              : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {progressInfo.stage === 'failed' ? (
                <AlertCircle size={18} color="#dc2626" />
              ) : isCompleted ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <Loader2 size={18} color="var(--accent-purple)" className="animate-spin" />
              )}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: progressInfo.stage === 'failed' ? '#dc2626' : 'var(--text-primary)'
              }}>
                {progressInfo.message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLogsOpen(!logsOpen)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid var(--border-light)'
              }}
            >
              <Terminal size={13} />
              <span>{logsOpen ? 'Hide Logs' : 'Live Logs'}</span>
              {logsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expandable Live Terminal Drawer */}
          {logsOpen && (
            <div
              ref={logTerminalRef}
              style={{
                marginTop: '14px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
              }}
            >
              {logText || 'Waiting for Demucs & FFmpeg daemon stdout...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
