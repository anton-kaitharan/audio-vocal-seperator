'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  FileAudio,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  Disc,
  ChevronDown,
  Volume2,
  Music,
  ShieldCheck,
  Cpu,
  Download,
  Mic,
  Headphones,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [activeStem, setActiveStem] = useState<'master' | 'vocals' | 'backing' | 'drums' | 'bass'>('master');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stemDetails = {
    master: { title: 'Full Master Mix', desc: 'Original stereo track before separation', color: '#1a1712', bg: '#eae6dc' },
    vocals: { title: 'Isolated Acapella', desc: 'Crystal-clear lead & backing vocals only', color: '#FF2500', bg: '#fff1ee' },
    backing: { title: 'Karaoke Instrumental', desc: 'Full backing track with vocals completely removed', color: '#4c63c7', bg: '#e6ecfb' },
    drums: { title: 'Percussion & Drums', desc: 'Punchy kick, snare, and cymbals stem', color: '#ea580c', bg: '#fff7ed' },
    bass: { title: 'Sub & Bassline', desc: 'Clean low-end frequency bass stem', color: '#0284c7', bg: '#f0f9ff' }
  };

  const faqs = [
    {
      q: 'How does AuraVocal extract vocals from audio or YouTube videos?',
      a: 'AuraVocal uses Meta’s state-of-the-art Demucs v4 neural network architecture. When you upload an audio file or paste a YouTube URL, our GPU cluster downloads the stream, demixes the waveform into 4 discrete audio stems (Vocals, Drums, Bass, Other), normalizes the EBU R128 loudness, and packages it into lossless 44.1kHz 16-bit WAV files.'
    },
    {
      q: 'Is there any loss in audio quality during stem isolation?',
      a: 'No. Unlike basic phase-cancellation tools, our pipeline processes audio at full PCM 16-bit resolution. Exports retain full frequency spectrum coverage from 20Hz to 20kHz without muffled artifacts or metallic flange.'
    },
    {
      q: 'Can I transpose the pitch or edit stems directly in my browser?',
      a: 'Yes! AuraVocal features a built-in Browser DAW Workstation. You can pitch shift tracks in real-time (Hz scale), adjust volume sliders per stem, draw fade envelope curves, mute/solo lanes, and export stem bundles directly.'
    },
    {
      q: 'Do I own the rights to the separated stems?',
      a: 'Yes, you retain full rights to all processing outputs. You can freely use separated vocals and instrumental backing tracks for music production, DJ remixes, karaoke covers, or live sampling.'
    }
  ];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg-ref)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      overflowX: 'hidden'
    }}>
      {/* ========== FLOATING GLASS NAVIGATION BAR ========== */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '1240px',
        zIndex: 100
      }}>
        <header style={{
          height: '60px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '9999px',
          boxShadow: '0 12px 30px -10px rgba(38, 34, 28, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px 0 24px'
        }}>
          {/* Logo & Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 37, 0, 0.35)'
            }}>
              <Disc size={18} color="#ffffff" />
            </div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: 'var(--ink)'
            }}>
              Aura<span style={{ color: 'var(--orange)' }}>Vocal</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }}>
            <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--prose-ref)', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
            <a href="#demo" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--prose-ref)', textDecoration: 'none', transition: 'color 0.15s' }}>Stem Demo</a>
            <a href="#pricing" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--prose-ref)', textDecoration: 'none', transition: 'color 0.15s' }}>Pricing</a>
            <a href="#faq" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--prose-ref)', textDecoration: 'none', transition: 'color 0.15s' }}>FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/test" style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--peri-ink)',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '9999px',
              background: 'var(--peri-panel)',
              border: '1px solid rgba(76, 99, 199, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Activity size={14} />
              <span>Sandbox</span>
            </Link>

            {isAuthenticated ? (
              <Link href="/studio" style={{
                background: 'var(--orange)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 20px -4px rgba(255, 37, 0, 0.4)',
                transition: 'transform 0.15s ease'
              }}>
                <span>Open Studio</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={openAuthModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    padding: '8px 12px'
                  }}
                >
                  Sign In
                </button>
                <Link href="/studio" style={{
                  background: 'var(--orange)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 8px 20px -4px rgba(255, 37, 0, 0.4)'
                }}>
                  <span>Launch Studio</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* ========== HERO SECTION ========== */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '150px 24px 80px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Top Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'var(--peri-panel)',
          border: '1px solid var(--peri)',
          color: 'var(--peri-ink)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(172, 196, 247, 0.25)'
        }}>
          <Sparkles size={14} color="var(--peri-ink)" />
          <span>Meta Demucs v4 Neural Engine • 44.1kHz PCM Master</span>
        </div>

        {/* Display Heading in EB Garamond Serif */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(42px, 6vw, 76px)',
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-1.5px',
          maxWidth: '960px',
          color: 'var(--ink)'
        }}>
          A vocal separator and stem studio <br />
          that <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>producers actually need.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 1.3vw, 20px)',
          color: 'var(--body-dim-ref)',
          maxWidth: '680px',
          marginTop: '24px',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Extract clean acapellas, karaoke backing tracks, isolated drums, and sub-bass stems from any audio file or YouTube video in seconds.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/studio" style={{
            background: 'var(--orange)',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 700,
            padding: '16px 36px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 20px 40px -10px rgba(255, 37, 0, 0.45)',
            transition: 'all 0.2s ease'
          }}>
            <Sliders size={18} />
            <span>Launch Audio Studio</span>
            <ArrowRight size={16} />
          </Link>

          <Link href="/test" style={{
            background: 'var(--card-ref)',
            color: 'var(--ink)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 600,
            padding: '16px 28px',
            borderRadius: '9999px',
            border: '1px solid var(--line-ref)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px -6px rgba(38, 34, 28, 0.12)'
          }}>
            <Activity size={18} color="var(--peri-ink)" />
            <span>Try Test Sandbox</span>
          </Link>
        </div>

        {/* Key Metrics / Highlights */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '36px',
          marginTop: '44px',
          flexWrap: 'wrap',
          fontSize: '13px',
          color: 'var(--muted)',
          fontWeight: 500
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--orange)" />
            <span>Under 20s GPU Demixing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--orange)" />
            <span>44.1kHz Lossless WAV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--orange)" />
            <span>Zero Phase Distortion</span>
          </div>
        </div>
      </section>

      {/* ========== INTERACTIVE STEM AUDIO DEMO BENTO ========== */}
      <section id="demo" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 100px 24px' }}>
        <div style={{
          background: 'var(--card-ref)',
          border: '1px solid var(--line-ref)',
          borderRadius: '32px',
          padding: '36px 36px',
          boxShadow: 'var(--shadow-ref)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '4px'
              }}>
                Interactive Preview
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--ink)' }}>
                Listen to Isolated Stems
              </h2>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: 'var(--ink)',
                color: 'var(--bg-ref)',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(26, 23, 18, 0.2)'
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause Audio Preview' : 'Play Audio Preview'}</span>
            </button>
          </div>

          {/* Stem Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {(Object.keys(stemDetails) as Array<keyof typeof stemDetails>).map(key => {
              const stem = stemDetails[key];
              const isActive = activeStem === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveStem(key)}
                  style={{
                    background: isActive ? stem.bg : 'var(--bg-ref)',
                    border: isActive ? `2px solid ${stem.color}` : '1px solid var(--line-ref)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: isActive ? stem.color : 'var(--ink)' }}>
                    {stem.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    {stem.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Waveform Visualizer Display */}
          <div style={{
            background: 'var(--ink-2)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--orange)', animation: isPlaying ? 'pulse 1s infinite' : 'none' }} />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#a1a1aa' }}>
                  ACTIVE STEM: <strong style={{ color: '#ffffff' }}>{stemDetails[activeStem].title.toUpperCase()}</strong>
                </span>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#71717a' }}>
                00:42 / 03:15 • 44.1kHz WAV
              </span>
            </div>

            {/* Simulated Animated Waveform Bars */}
            <div style={{ height: '64px', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
              {Array.from({ length: 50 }).map((_, i) => {
                const height = Math.sin(i * 0.4) * 20 + 28 + (isPlaying ? (i % 3) * 6 : 0);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}px`,
                      background: i < 20 ? stemDetails[activeStem].color : 'rgba(255,255,255,0.15)',
                      borderRadius: '2px',
                      transition: 'height 0.15s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Audio Controls Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#a1a1aa' }}>
                <Volume2 size={16} />
                <span>Stem Gain: <strong>0.0 dB</strong></span>
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                Processed by Meta Demucs AI Model
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BENTO GRID FEATURE HIGHLIGHTS ========== */}
      <section id="features" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '8px' }}>
            Built for Audio Excellence
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, color: 'var(--ink)' }}>
            Everything you need for stem separation.
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
          
          {/* Card 1 (Large 8 Cols): 4-Stem Separation */}
          <div style={{
            gridColumn: 'span 8',
            background: 'var(--card-ref)',
            border: '1px solid var(--line-ref)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: 'var(--shadow-ref)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--peri-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Layers size={22} color="var(--peri-ink)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
                4-Stem AI Neural Demixing
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--body-dim-ref)', lineHeight: 1.6, maxWidth: '540px' }}>
                Isolate lead vocals, drums, bass, and instrumental accompaniment with state-of-the-art Meta Demucs v4 deep learning models.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '9999px', background: 'var(--bg-ref)', color: 'var(--ink)' }}>Vocals (Acapella)</span>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '9999px', background: 'var(--bg-ref)', color: 'var(--ink)' }}>Drums & Percussion</span>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '9999px', background: 'var(--bg-ref)', color: 'var(--ink)' }}>Sub-Bass & Synths</span>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '9999px', background: 'var(--bg-ref)', color: 'var(--ink)' }}>Instrumental Backing</span>
            </div>
          </div>

          {/* Card 2 (Small 4 Cols): Studio PCM Master */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--peri-panel)',
            border: '1px solid var(--peri)',
            borderRadius: '28px',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <FileAudio size={22} color="var(--peri-ink)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
                44.1kHz PCM WAV
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--prose-ref)', lineHeight: 1.6 }}>
                Export studio-grade uncompressed audio files ready for direct import into Ableton, Logic, FL Studio, or Pro Tools.
              </p>
            </div>
          </div>

          {/* Card 3 (Small 4 Cols): GPU Acceleration */}
          <div style={{
            gridColumn: 'span 4',
            background: 'var(--card-ref)',
            border: '1px solid var(--line-ref)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: 'var(--shadow-ref)'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff1ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap size={22} color="var(--orange)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
              Under 20s Processing
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--body-dim-ref)', lineHeight: 1.6 }}>
              Powered by CUDA GPU clusters for lightning-fast demixing with zero queue bottlenecking.
            </p>
          </div>

          {/* Card 4 (Large 8 Cols): Full Browser DAW Workstation */}
          <div style={{
            gridColumn: 'span 8',
            background: 'var(--card-ref)',
            border: '1px solid var(--line-ref)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: 'var(--shadow-ref)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Sliders size={22} color="#0284c7" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
                Full Browser DAW Workstation
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--body-dim-ref)', lineHeight: 1.6, maxWidth: '540px' }}>
                Pitch shift tracks in real-time, fine-tune fade-in/out bezier automation curves, mute/solo individual lanes, and master output loudness.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========== PRICING TIERS SECTION ========== */}
      <section id="pricing" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '8px' }}>
            Transparent Plans
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, color: 'var(--ink)' }}>
            Simple pricing for creators & studios.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Free Tier */}
          <div style={{
            background: 'var(--card-ref)',
            border: '1px solid var(--line-ref)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: 'var(--shadow-ref)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>Starter</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>For casual listening & quick vocal checks</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 600, marginTop: '20px', color: 'var(--ink)' }}>
                $0 <span style={{ fontSize: '14px', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>/ forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--prose-ref)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> 2 separations per day</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Standard 2-stem vocal remover</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> MP3 320kbps export format</li>
              </ul>
            </div>
            <Link href="/studio" style={{
              marginTop: '32px',
              textAlign: 'center',
              background: 'var(--bg-ref)',
              color: 'var(--ink)',
              padding: '14px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid var(--line-ref)'
            }}>
              Start Free Studio Session
            </Link>
          </div>

          {/* Pro Tier (Featured Orange Highlight) */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff, #fff7f2)',
            border: '2px solid var(--orange)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: '0 30px 60px -20px rgba(255, 37, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-13px', right: '28px', background: 'var(--orange)', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
              Most Popular
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--orange)' }}>Pro Producer</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>For active music producers & DJs</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 600, marginTop: '20px', color: 'var(--ink)' }}>
                $14.99 <span style={{ fontSize: '14px', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--ink)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Unlimited stem separations</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> 4-stem demixing (Vocals, Drums, Bass)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Lossless 44.1kHz 16-bit WAV export</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Priority CUDA GPU queue (under 20s)</li>
              </ul>
            </div>
            <Link href="/studio" style={{
              marginTop: '32px',
              textAlign: 'center',
              background: 'var(--orange)',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 8px 20px -4px rgba(255, 37, 0, 0.4)'
            }}>
              Upgrade to Pro Studio
            </Link>
          </div>

          {/* Studio Tier */}
          <div style={{
            background: 'var(--card-ref)',
            border: '1px solid var(--line-ref)',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: 'var(--shadow-ref)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>Studio Label</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>For record labels & commercial API integration</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 600, marginTop: '20px', color: 'var(--ink)' }}>
                $49.00 <span style={{ fontSize: '14px', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--prose-ref)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Batch folder processing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> REST API & Webhook access</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={16} color="var(--orange)" /> Commercial licensing rights</li>
              </ul>
            </div>
            <Link href="/studio" style={{
              marginTop: '32px',
              textAlign: 'center',
              background: 'var(--bg-ref)',
              color: 'var(--ink)',
              padding: '14px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid var(--line-ref)'
            }}>
              Contact Sales
            </Link>
          </div>

        </div>
      </section>

      {/* ========== FAQ ACCORDION SECTION ========== */}
      <section id="faq" style={{ maxWidth: '840px', margin: '0 auto', padding: '0 24px 100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '8px' }}>
            Got Questions?
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 600, color: 'var(--ink)' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--card-ref)',
                  border: '1px solid var(--line-ref)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px -6px rgba(30, 28, 24, 0.08)'
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--muted)"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: '14px', color: 'var(--body-dim-ref)', lineHeight: 1.65 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{
        background: 'var(--ink-2)',
        color: '#ffffff',
        padding: '60px 24px 40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Disc size={18} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
                Aura<span style={{ color: 'var(--orange)' }}>Vocal</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#a1a1aa' }}>
              <Link href="/studio" style={{ color: '#ffffff', textDecoration: 'none' }}>Studio Workstation</Link>
              <Link href="/test" style={{ color: '#ffffff', textDecoration: 'none' }}>Test Sandbox</Link>
              <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Features</a>
              <a href="#pricing" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Pricing</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#71717a', flexWrap: 'wrap', gap: '12px' }}>
            <div>© 2026 AuraVocal Studio • Powered by Meta Demucs AI Neural Audio Demixing</div>
            <div>Designed with Warm Editorial Typography & Vibrant Orange Aesthetics</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
