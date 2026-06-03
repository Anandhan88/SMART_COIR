'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage() {
  const { t } = useLanguage();
  const [roleMode, setRoleMode] = useState('client'); // 'client' or 'admin'
  const [email, setEmail] = useState('client@coirbuyer.com');
  const [password, setPassword] = useState('clientpassword');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();

  const handleRoleToggle = (mode) => {
    setRoleMode(mode);
    setErrorMsg('');
    if (mode === 'client') {
      setEmail('client@coirbuyer.com');
      setPassword('clientpassword');
    } else {
      setEmail('admin@smartcoir.com');
      setPassword('adminpassword');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#08080F',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,105,20,0.06) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '24px',
          padding: '44px 36px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header / Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', outline: 'none' }}>
            <img 
              src="/images/coconut_tree_logo.png?v=2" 
              alt="Smart Coir Logo" 
              style={{ width: '44px', height: '44px', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0' }}>
              Smart<span style={{ color: '#C9A84C' }}>Coir</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EBE0', fontFamily: 'Space Grotesk', marginBottom: '6px' }}>
            {t('signInPortal')}
          </h2>
          <p style={{ fontSize: '13px', color: '#8A8070', fontFamily: 'Poppins' }}>
            {t('selectRole')}
          </p>
        </div>

        {/* Client / Admin Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '28px',
        }}>
          <button
            onClick={() => handleRoleToggle('client')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: roleMode === 'client' ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: roleMode === 'client' ? '#C9A84C' : '#8A8070',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'Poppins',
            }}
          >
            {t('clientPortal')}
          </button>
          <button
            onClick={() => handleRoleToggle('admin')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: roleMode === 'admin' ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: roleMode === 'admin' ? '#C9A84C' : '#8A8070',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'Poppins',
            }}
          >
            {t('adminPanel')}
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '24px',
              fontFamily: 'Poppins',
            }}
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '12px', fontWeight: 500, color: '#A09888', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('emailAddress')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#F0EBE0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: 'Poppins',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #C9A84C';
                e.target.style.background = 'rgba(201, 168, 76, 0.02)';
                e.target.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: '12px', fontWeight: 500, color: '#A09888', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t('password')}
              </label>
              <Link href="/login/forgot" style={{ fontSize: '12px', color: '#C9A84C', fontFamily: 'Poppins', textDecoration: 'none' }}>
                {t('forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#F0EBE0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: 'Poppins',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #C9A84C';
                e.target.style.background = 'rgba(201, 168, 76, 0.02)';
                e.target.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)',
              color: '#08080F',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'Poppins',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(201, 168, 76, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 30px rgba(201, 168, 76, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'none';
              e.target.style.boxShadow = '0 4px 20px rgba(201, 168, 76, 0.2)';
            }}
          >
            {loading ? t('authenticating') : `${t('signInBtn')} to ${roleMode === 'client' ? t('clientPortal') : t('adminPanel')}`}
          </button>
        </form>

        {/* Register footer link */}
        {roleMode === 'client' && (
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#8A8070', fontFamily: 'Poppins' }}>
            {t('dontHaveAccount')}{' '}
            <Link href="/register" style={{ color: '#C9A84C', fontWeight: 500, textDecoration: 'none' }}>
              {t('createOneNow')}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
