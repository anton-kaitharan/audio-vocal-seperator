export interface StemTrack {
  id: string;
  name: string;
  type: 'vocals' | 'backing' | 'drums' | 'bass' | 'other' | 'instrumental' | 'karaoke' | 'master';
  color: string; // e.g. '#8b5cf6', '#a855f7', '#f97316', '#06b6d4'
  muted: boolean;
  soloed: boolean;
  locked: boolean;
  volume: number; // 0 to 1
  audioUrl?: string;
  waveformSeed: number; // For rendering high-resolution studio waveforms
  envelopeCurve?: {
    points: { x: number; y: number }[]; // Bezier/envelope automation points
  };
  markers?: {
    id: string;
    time: number;
    label: string;
    avatarUrl?: string;
  }[];
}

export interface StudioProject {
  id: string;
  title: string;
  duration: number; // in seconds
  sampleRate: string; // e.g. '44.1 kHz'
  bitDepth: string; // e.g. '16-bit PCM'
  format: string; // e.g. 'Stereo WAV'
  bpm: number;
  key: string;
  tracks: StemTrack[];
}

export interface InspectorState {
  fadeType: 'none' | 'linear' | 'bezier' | 'exponential';
  bezierParams: string; // '0, 0.5, 1, 0.5'
  envelopeAmp: number; // 0 - 1000
  selectedEffect: string; // 'Reverse audio', 'Vocal isolator', 'De-reverb', etc.
  playbackSpeed: number; // e.g. 110.50 (%)
  pitchShiftHz: number; // e.g. 441.40 (Hz)
  pitchShiftSemitones: number; // e.g. +0.00
  reverbDelay: number; // ms
  reverbDecay: number; // %
}

export interface BackendStatus {
  cuda_available: boolean;
  gpu_name: string;
  watcher_running: boolean;
  queue_count: number;
  processing_count: number;
  done_count: number;
  failed_count?: number;
  output_count: number;
}
