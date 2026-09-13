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
