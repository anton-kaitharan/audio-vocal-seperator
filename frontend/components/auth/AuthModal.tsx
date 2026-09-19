'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(loginIdentifier, loginPassword);
      setLoginIdentifier('');
      setLoginPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await register(regUsername, regEmail, regPassword);
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={closeAuthModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(185, 240, 59, 0.1)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={18} color="#0E0E0E" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {tab === 'login' ? 'Welcome Back' : 'Create Studio Account'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Vocal Separator & AI Stem Studio
              </div>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-main)' }}>
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: tab === 'login' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: tab === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: tab === 'register' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: tab === 'register' ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '18px'
              }}
            >
              {errorMsg}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    style={{
                      width: '100%',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '10px 36px 10px 36px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '12px',
                      background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
                  color: '#0E0E0E',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(185, 240, 59, 0.3)',
                  marginTop: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Sign In to Studio</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="producer_alex"
                    style={{
                      width: '100%',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <User size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alex@example.com"
                    style={{
                      width: '100%',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '10px 12px 10px 36px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Password (min. 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '10px 36px 10px 36px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '12px',
                      background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), #90cb18)',
                  color: '#0E0E0E',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(185, 240, 59, 0.3)',
                  marginTop: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
