'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    role: 'client', // Default to client, admins are created directly in database
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setErrorMsg('Please fill in all personal details.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }
    setErrorMsg('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company) {
      setErrorMsg('Please enter your company name.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await register(formData);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your details and try again.');
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
      background: '#F8F5F0',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45, 106, 79,0.05) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(27, 67, 50,0.06) 0%, transparent 70%)',
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
          maxWidth: '500px',
          background: 'rgba(0, 0, 0, 0.015)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          borderRadius: '24px',
          padding: '44px 36px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.06)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header / Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', outline: 'none' }}>
            <img 
              src="/images/coconut_tree_logo.png?v=2" 
              alt="Smart Coir Logo" 
              style={{ width: '44px', height: '44px', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E' }}>
              Smart<span style={{ color: '#2D6A4F' }}>Coir</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A2E', fontFamily: 'Space Grotesk', marginBottom: '6px' }}>
            {t('createAccountPortal')}
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', fontFamily: 'Poppins' }}>
            {step === 1 ? `${t('step')} 1: ${t('personalDetails')}` : `${t('step')} 2: ${t('companyDetails')}`}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '2px', marginBottom: '28px', overflow: 'hidden' }}>
          <motion.div 
            animate={{ width: step === 1 ? '50%' : '100%' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #1B4332, #2D6A4F)' }}
          />
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
              color: '#D00000',
              fontSize: '13px',
              marginBottom: '24px',
              fontFamily: 'Poppins',
            }}
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form and step containers */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('emailAddress')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #95D5B2 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '10px',
                    boxShadow: '0 4px 20px rgba(45, 106, 79, 0.2)',
                  }}
                >
                  {t('continue')} →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('companyName')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Coir Products Ltd."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', fontFamily: 'Poppins', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('role')}
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'Poppins',
                    }}
                  >
                    <option value="client">{t('clientPortal')} ({t('buyCoir')})</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: '1.5px solid rgba(45, 106, 79, 0.4)',
                      color: '#2D6A4F',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      cursor: 'pointer',
                    }}
                  >
                    ← {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #95D5B2 100%)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(45, 106, 79, 0.2)',
                    }}
                  >
                    {loading ? t('registering') : t('registerBtn')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Login footer link */}
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#475569', fontFamily: 'Poppins' }}>
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" style={{ color: '#2D6A4F', fontWeight: 600, textDecoration: 'none' }}>
            {t('backToLogin')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
