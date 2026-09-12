'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MacTitlebar } from '../../components/studio/MacTitlebar';
import {
  Activity,
  Cpu,
  Server,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Send,
  Clock,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import {
  fetchBackendStatus,
  fetchJobsList,
  fetchJobLog,
  toggleWatcher,
  submitSeparationJob,
} from '../../lib/api';
import { BackendStatus } from '../../types/studio';

export default function TestRouterPage() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<{ processing: any[]; queue: any[]; done: any[]; failed?: any[] }>({ processing: [], queue: [], done: [], failed: [] });
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [logText, setLogText] = useState<string>('Select a job or trigger an action to view real-time logs...');
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingWatcher, setIsTogglingWatcher] = useState(false);

  // Test form state
  const [testUrl, setTestUrl] = useState('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  const [testTitle, setTestTitle] = useState('Queen - Bohemian Rhapsody (Test)');
  const [testStart, setTestStart] = useState('00:00:10');
  const [testEnd, setTestEnd] = useState('00:00:30');
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    const res = await fetchBackendStatus();
    setIsLoading(false);
    if (res.ok && res.data) {
      setStatus(res.data);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }

    const jList = await fetchJobsList();
    setJobs(jList);
    if (jList.processing.length > 0 && !selectedJob) {
      setSelectedJob(jList.processing[0].filename);
    } else if (jList.done.length > 0 && !selectedJob) {
      setSelectedJob(jList.done[0].filename);
    } else if (jList.failed && jList.failed.length > 0 && !selectedJob) {
      setSelectedJob(jList.failed[0].filename);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    const loadLog = async () => {
      const text = await fetchJobLog(selectedJob);
      setLogText(text);
    };
    loadLog();
    const interval = setInterval(loadLog, 2000);
    return () => clearInterval(interval);
  }, [selectedJob]);

  const handleToggleWatcher = async () => {
    if (!status) return;
    setIsTogglingWatcher(true);
    const action = status.watcher_running ? 'stop' : 'start';
    await toggleWatcher(action);
    await checkStatus();
    setIsTogglingWatcher(false);
  };

  const handleRunSeparationTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSubmitting(true);
    setTestResult(null);

    const res = await submitSeparationJob({
      url: testUrl,
      title: testTitle,
      start: testStart,
      end: testEnd
    });

    setTestSubmitting(false);
    setTestResult(res);
    if (res.filename) {
      setSelectedJob(res.filename);
    }
    await checkStatus();
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f8fafc',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Title Bar */}
      <MacTitlebar
        projectTitle="AuraVocal Backend Test & Diagnostics Sandbox"
        onImportClick={() => {}}
        onExportClick={() => {}}
        activeRoute="test"
      />

      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(2, 132, 199, 0.04))',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--accent-purple)" />
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Interactive Test Sandbox (`/test`)
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Directly verify API connectivity, trigger isolated separation jobs, inspect GPU telemetry, and view live stdout logs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={checkStatus}
              disabled={isLoading}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>

            <Link
              href="/studio"
              style={{
                background: 'var(--accent-purple)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px var(--accent-purple-glow)'
              }}
            >
              <Sliders size={14} />
              <span>Open Studio DAW</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Backend Status Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Server size={22} color={isConnected ? '#059669' : '#dc2626'} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Backend API Server
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isConnected ? '#059669' : '#dc2626', marginTop: '2px' }}>
                {isConnected ? 'Online (localhost:5000)' : 'Offline / Standalone'}
              </div>
            </div>
          </div>

          {/* GPU Hardware Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: status?.cuda_available ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} color={status?.cuda_available ? '#059669' : '#d97706'} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AI Acceleration
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {status?.gpu_name || (status?.cuda_available ? 'CUDA Active' : 'CPU Inference Mode')}
              </div>
            </div>
          </div>

          {/* Watcher Service Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: status?.watcher_running ? 'rgba(124, 58, 237, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={22} color={status?.watcher_running ? 'var(--accent-purple)' : '#6b7280'} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Queue Watcher
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: status?.watcher_running ? 'var(--accent-purple)' : 'var(--text-muted)', marginTop: '2px' }}>
                  {status?.watcher_running ? 'Running (Active)' : 'Stopped'}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleWatcher}
              disabled={isTogglingWatcher || !isConnected}
              style={{
                background: status?.watcher_running ? '#fee2e2' : '#ecfdf5',
                border: status?.watcher_running ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                color: status?.watcher_running ? '#dc2626' : '#059669',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {status?.watcher_running ? <Square size={12} /> : <Play size={12} />}
              <span>{status?.watcher_running ? 'Stop' : 'Start'}</span>
            </button>
          </div>

          {/* Queue Statistics Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={22} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Queue State
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{status?.processing_count || 0}</span> processing •{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{status?.queue_count || 0}</span> queued •{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{status?.output_count || 0}</span> outputs
                {Boolean(status?.failed_count) && (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}> • {status?.failed_count} failed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* LEFT: SUBMIT TEST JOB */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="var(--accent-purple)" />
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Trigger Audio Separation Test</h2>
            </div>

            <form onSubmit={handleRunSeparationTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Job / Track Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Trim Start
                  </label>
                  <input
                    type="text"
                    value={testStart}
                    onChange={(e) => setTestStart(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Trim End
                  </label>
                  <input
                    type="text"
                    value={testEnd}
                    onChange={(e) => setTestEnd(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={testSubmitting}
                style={{
                  background: 'var(--accent-purple)',
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
                  marginTop: '6px'
                }}
              >
                <Sparkles size={16} />
                <span>{testSubmitting ? 'Dispatching Job...' : 'Execute Separation Benchmark'}</span>
              </button>
            </form>

            {testResult && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ color: '#059669', fontWeight: 700, marginBottom: '4px' }}>✓ Job Dispatched:</div>
                <pre style={{ margin: 0, color: 'var(--text-primary)', overflowX: 'auto' }}>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT: REAL-TIME TERMINAL LOG VIEWER */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            {/* Terminal Header */}
            <div style={{
              height: '42px',
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="var(--accent-purple)" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Raw Backend Terminal Output</span>
              </div>

              {/* Job Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    maxWidth: '180px'
                  }}
                >
                  <option value="">(Select Job Log)</option>
                  {jobs.processing.map((j) => (
                    <option key={j.filename} value={j.filename}>⚡ {j.title || j.filename}</option>
                  ))}
                  {jobs.done.map((j) => (
                    <option key={j.filename} value={j.filename}>✓ {j.title || j.filename}</option>
                  ))}
                  {jobs.failed && jobs.failed.map((j) => (
                    <option key={j.filename} value={j.filename}>✗ {j.title || j.filename} (Failed)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Terminal Body */}
            <div style={{
              flex: 1,
              padding: '16px',
              background: '#0f172a',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.6,
              color: '#f8fafc',
              overflowY: 'auto',
              maxHeight: '380px'
            }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                {logText}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
