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
  Disc
} from 'lucide-react';

export default function LandingPage() {
  const [activeStemDemo, setActiveStemDemo] = useState<'master' | 'vocals' | 'karaoke' | 'drums'>('master');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#ffffff',
      color: 'var(--text-primary)',
      overflowX: 'hidden'
    }}>
      {/* Top Navigation */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px var(--accent-purple-glow)'
          }}>
            <Disc size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
            Aura<span style={{ color: 'var(--accent-purple)' }}>Vocal</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/test" style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#059669',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.08)'
          }}>
            <Activity size={14} />
            <span>Test Sandbox (`/test`)</span>
          </Link>

          <Link href="/studio" style={{
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px var(--accent-purple-glow)'
          }}>
            <span>Launch Studio</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 20px 60px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          color: 'var(--accent-purple)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={14} />
          <span>Meta Demucs AI Separation Engine • 44.1kHz Studio Master</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          maxWidth: '900px',
          color: '#0f172a'
        }}>
          Split Vocals & Audio Stems <br />
          <span style={{
            background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            From Any YouTube Track in Seconds
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          marginTop: '20px',
          lineHeight: 1.6
        }}>
          Transform any song into studio-quality karaoke acapella, backing tracks, drums, and bass stems.
          Featuring our full browser-based audio workstation with pitch transposition and envelope automation.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/studio" style={{
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 600,
            padding: '14px 28px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px var(--accent-purple-glow)'
          }}>
            <Sliders size={18} />
            <span>Open Studio Workstation</span>
          </Link>

          <Link href="/test" style={{
            background: '#ffffff',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 600,
            padding: '14px 24px',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <Activity size={18} color="#059669" />
            <span>Open Testing Sandbox</span>
          </Link>
        </div>

        {/* Interactive Stem Audio Showcase */}
        <div style={{
          width: '100%',
          maxWidth: '840px',
          marginTop: '60px',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Stem Isolation Preview
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Queen — Bohemian Rhapsody (Stem Demixing)
              </div>
            </div>

            <button
              onClick={() => setIsPlayingDemo(!isPlayingDemo)}
              style={{
                background: 'var(--accent-purple)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px var(--accent-purple-glow)'
              }}
            >
              {isPlayingDemo ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlayingDemo ? 'Pause Preview' : 'Play Preview'}</span>
            </button>
          </div>

          {/* Stem Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { id: 'master', label: 'Master Mix', color: 'var(--text-primary)', desc: 'Original Full Song' },
              { id: 'vocals', label: 'Vocals Only', color: 'var(--stem-vocals)', desc: 'Clean Isolated Acapella' },
              { id: 'karaoke', label: 'Instrumental', color: 'var(--stem-backing)', desc: 'Vocals Removed / Karaoke' },
              { id: 'drums', label: 'Drums & Bass', color: 'var(--stem-drums)', desc: 'Rhythm Section Only' }
            ].map(stem => (
              <button
                key={stem.id}
                onClick={() => setActiveStemDemo(stem.id as any)}
                style={{
                  background: activeStemDemo === stem.id ? 'rgba(124, 58, 237, 0.08)' : '#f8fafc',
                  border: activeStemDemo === stem.id ? '1px solid var(--accent-purple)' : '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: stem.color }}>{stem.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stem.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Engineered for Producers & Karaoke Creators</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Built on top of cutting-edge neural audio demixing algorithms.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
            <Layers size={28} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '14px', color: 'var(--text-primary)' }}>4-Stem Neural Separation</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Separate any audio into Vocals, Drums, Bass, and Other accompaniment with minimal artifacting.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
            <FileAudio size={28} color="#0284c7" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '14px', color: 'var(--text-primary)' }}>Studio Lossless Master</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Automatic silence stripping, EBU R128 loudness normalization, and crystal clear 44.1kHz 16-bit PCM WAV.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
            <Zap size={28} color="#ea580c" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '14px', color: 'var(--text-primary)' }}>GPU Accelerated Inference</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Leverages local CUDA cores or serverless GPU workers (Modal/RunPod) to demix songs in under 20 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / SaaS Monetization Tiers */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px 100px 20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Simple, Transparent SaaS Pricing</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Start for free, or upgrade for unlimited high-priority GPU separations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Free Tier */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Free Starter</div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>$0 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ forever</span></div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> 2 songs per day</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Standard 2-stem vocal remover</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> MP3 320kbps export</li>
            </ul>
            <Link href="/studio" style={{ marginTop: '24px', textAlign: 'center', background: '#f8fafc', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div style={{ background: '#ffffff', border: '2px solid var(--accent-purple)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.12)' }}>
            <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--accent-purple)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Most Popular</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-purple)' }}>Pro Producer</div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>$14.99 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Unlimited separations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> 4-stem demixing (Vocals, Drums, Bass)</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Studio lossless 44.1kHz WAV export</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Priority GPU queue (under 20s)</li>
            </ul>
            <Link href="/studio" style={{ marginTop: '24px', textAlign: 'center', background: 'var(--accent-purple)', color: '#fff', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 10px var(--accent-purple-glow)' }}>
              Upgrade to Pro
            </Link>
          </div>

          {/* Studio Tier */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Studio Label</div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>$49.00 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Batch folder processing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> API access & Webhook triggers</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} color="#059669" /> Commercial licensing rights</li>
            </ul>
            <Link href="/studio" style={{ marginTop: '24px', textAlign: 'center', background: '#f8fafc', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '30px 20px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)',
        background: '#f8fafc'
      }}>
        <div>AuraVocal Studio • Next.js 15 & Meta Demucs AI Audio Demixing</div>
        <div style={{ marginTop: '8px' }}>
          <Link href="/studio" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>Studio</Link>
          <Link href="/test" style={{ color: '#059669', textDecoration: 'none', margin: '0 10px' }}>Test Sandbox</Link>
        </div>
      </footer>
    </div>
  );
}
