'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClientProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || '',
        zipCode: user.address?.zipCode || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        }
      };
      
      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        setSuccessMsg(t('profileUpdatedSuccess'));
        // Update user details in localStorage
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...savedUser, ...res.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('profileUpdatedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('profile')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('profileSettingsDesc')}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(0, 0, 0, 0.01)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
        }}
      >
        {successMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '12px', color: '#2ecc71', fontSize: '13px', marginBottom: '24px', fontFamily: 'Poppins' }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#D00000', fontSize: '13px', marginBottom: '24px', fontFamily: 'Poppins' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Section 1: Basic Info */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#2D6A4F', marginBottom: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.02)', paddingBottom: '8px' }}>
              {t('companyContactInfo')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('fullName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                    border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('companyName')}</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                    border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('contactPhone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                    border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#2D6A4F', marginBottom: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.02)', paddingBottom: '8px' }}>
              {t('defaultCorporateAddress')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('streetAddress')}</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder={t('streetPlaceholder')}
                  style={{
                    padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                    border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('city')}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('stateProvince')}</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('country')}</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('zipPostalCode')}</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
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
              marginTop: '10px',
              width: '200px',
              alignSelf: 'flex-start',
            }}
          >
            {loading ? t('saving') : t('saveProfile')}
          </button>
        </form>
      </motion.div>

      <style jsx>{`
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
