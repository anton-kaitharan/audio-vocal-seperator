import { BackendStatus } from '../types/studio';

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchBackendStatus(): Promise<{ ok: boolean; data: BackendStatus | null; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, data: null, error: err.message || 'Cannot reach server' };
  }
}

export async function fetchYoutubeMetadata(url: string): Promise<{ title: string; duration: string; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/metadata?url=${encodeURIComponent(url)}`);
    return await res.json();
  } catch (err: any) {
    return { title: '', duration: '', error: err.message };
  }
}

export async function submitSeparationJob(payload: {
  url: string;
  title?: string;
  start?: string;
  end?: string;
}): Promise<{ status: string; filename?: string; download_url?: string; r2_key?: string; duration_seconds?: number; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { status: 'error', error: err.message };
  }
}

export async function fetchJobsList() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { processing: [], queue: [], done: [], failed: [] };
  }
}

export async function fetchOutputFiles() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/files`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { files: [] };
  }
}

export async function fetchJobLog(jobName: string): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/logs/${encodeURIComponent(jobName)}`);
    const data = await res.json();
    return data.log || '';
  } catch {
    return 'Failed to load logs.';
  }
}

export async function toggleWatcher(action: 'start' | 'stop') {
  try {
    const res = await fetch(`${BACKEND_URL}/api/watcher/${action}`, { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { status: 'error', error: err.message };
  }
}

export async function uploadAudioFile(
  file: File,
  title?: string,
  start?: string,
  end?: string
): Promise<{ status: string; filename?: string; title?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (start) formData.append('start', start);
    if (end) formData.append('end', end);

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return { status: 'error', error: err.message || 'File upload failed' };
  }
}

export async function fetchProjectsList(): Promise<{
  projects: Array<{
    id: string;
    title: string;
    mtime: number;
    stems: Record<string, string>;
    audio_urls: Record<string, string>;
  }>;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/projects`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { projects: [] };
  }
}

export function getProjectZipUrl(projectId: string): string {
  return `${BACKEND_URL}/api/projects/${encodeURIComponent(projectId)}/zip`;
}

export interface JobProgressInfo {
  stage: 'queued' | 'downloading' | 'separating' | 'mastering' | 'completed' | 'failed';
  percent?: number;
  message: string;
  stageIndex: number; // 0: download/ingest, 1: demucs separate, 2: master/export, 3: completed
}

export function parseLogProgress(log: string, hasFailed?: boolean, isDone?: boolean): JobProgressInfo {
  if (isDone) {
    return {
      stage: 'completed',
      percent: 100,
      message: 'Separation and mastering completed successfully.',
      stageIndex: 3
    };
  }

  if (hasFailed || (log && log.includes('ERROR:'))) {
    const errMatch = log.match(/ERROR:\s*(.+)/);
    return {
      stage: 'failed',
      message: errMatch ? errMatch[1].trim() : 'An error occurred during separation.',
      stageIndex: 0
    };
  }

  if (!log || log.trim().length === 0 || log.includes('No log generated yet')) {
    return {
      stage: 'queued',
      message: 'Queued in processing queue...',
      stageIndex: 0
    };
  }

  // Check from most advanced stage to earliest
  if (log.includes('Done processing:') || log.includes('Saved instrumental/karaoke') || log.includes('Sending file')) {
    return {
      stage: 'completed',
      percent: 100,
      message: 'All stems mastered and ready.',
      stageIndex: 3
    };
  }

  if (
    log.includes('Mastering audio') ||
    log.includes('Processing backing/karaoke') ||
    log.includes('Processing vocals audio stem') ||
    log.includes('[ffmpeg]')
  ) {
    return {
      stage: 'mastering',
      percent: 85,
      message: 'Mastering & normalizing audio stems (FFmpeg)...',
      stageIndex: 2
    };
  }

  if (
    log.includes('Separating vocals') ||
    log.includes('Starting vocal separation') ||
    log.includes('[demucs]') ||
    log.includes('htdemucs')
  ) {
    // Try to extract demucs progress percentage if available
    const demucsMatch = log.match(/(\d{1,3})%\|/);
    const pct = demucsMatch ? Math.min(95, Math.max(10, parseInt(demucsMatch[1], 10))) : 50;
    return {
      stage: 'separating',
      percent: pct,
      message: `Demucs AI neural network isolating stems... ${pct > 10 ? `(${pct}%)` : ''}`,
      stageIndex: 1
    };
  }

  if (
    log.includes('Starting download') ||
    log.includes('Downloading...') ||
    log.includes('[yt-dlp]') ||
    log.includes('Ingesting local') ||
    log.includes('Preparing local audio')
  ) {
    const dlMatch = log.match(/Downloading\.\.\.\s*(\d{1,3}(?:\.\d+)?)%/);
    const pct = dlMatch ? parseFloat(dlMatch[1]) : 20;
    return {
      stage: 'downloading',
      percent: Math.min(99, pct),
      message: dlMatch ? `Downloading audio source... ${dlMatch[1]}%` : 'Ingesting audio stream...',
      stageIndex: 0
    };
  }

  return {
    stage: 'downloading',
    message: 'Initializing AI audio pipeline...',
    stageIndex: 0
  };
}

