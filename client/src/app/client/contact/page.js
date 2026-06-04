'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClientContact() {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      setErrorMsg(t('fillSubjectMessage'));
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // Simulate sending inquiry
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMsg(t('inquirySubmittedSuccess'));
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(t('inquirySubmittedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('contactAdmin')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('contactAdminDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px' }} className="contact-grid">
        
        {/* Left Column: Office Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.01)',
            border: '1px solid rgba(0, 0, 0, 0.03)',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#2D6A4F', marginBottom: '20px' }}>
              {t('factoryHeadquarters')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px', fontFamily: 'Poppins' }}>
              <div>
                <div style={{ color: '#8E8E9A', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('address')}</div>
                <div style={{ color: '#1A1A2E', lineHeight: 1.6 }}>
                  Smart Coir Decorticating & Spun Units,<br />
                  Palakkad Road, Pollachi,<br />
                  Tamil Nadu, India - 642001
                </div>
              </div>
              
              <div>
                <div style={{ color: '#8E8E9A', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('wholesaleHelpline')}</div>
                <div style={{ color: '#1A1A2E', fontWeight: 500 }}>+91 98765 43210</div>
              </div>

              <div>
                <div style={{ color: '#8E8E9A', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('emailSupport')}</div>
                <div style={{ color: '#1A1A2E', fontWeight: 500 }}>logistics@smartcoir.com</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(45, 106, 79, 0.02)',
            border: '1px solid rgba(45, 106, 79, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#5C5C6B',
            fontFamily: 'Poppins',
          }}>
            ℹ️ <strong>{t('directBulkInquiries')}</strong><br />
            {t('bulkInquiryDesc')}
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.015)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '24px' }}>
            {t('submitSupportInquiry')}
          </h3>

          {successMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '12px', color: '#2ecc71', fontSize: '13px', marginBottom: '20px', fontFamily: 'Poppins' }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#D00000', fontSize: '13px', marginBottom: '20px', fontFamily: 'Poppins' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5C5C6B', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('subject')}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('subjectPlaceholder')}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.015)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  color: '#1A1A2E',
                  outline: 'none',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5C5C6B', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('message')}
              </label>
              <textarea
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.015)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  color: '#1A1A2E',
                  outline: 'none',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  resize: 'none',
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
              {loading ? t('submittingInquiry') : t('sendInquiryBtn')}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
