'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#08080F',
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.95,
        }}
      />

      {/* Dark overlay gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(8,8,15,0.8) 0%, rgba(8,8,15,0.55) 30%, rgba(8,8,15,0.12) 60%, rgba(8,8,15,0) 100%)',
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(to top, #08080F, transparent)',
        }}
      />

      {/* Subtle gold accent glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }} />

      {/* Content */}
      <div className="container-main" style={{ position: 'relative', zIndex: 10, paddingTop: 160, paddingBottom: 120 }}>
        <div style={{ maxWidth: 650 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(201, 168, 76, 0.1)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
              marginBottom: 40,
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#C9A84C',
              boxShadow: '0 0 10px #C9A84C',
            }} />
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 3,
              textTransform: 'uppercase', color: '#C9A84C',
              fontFamily: 'Poppins',
            }}>
              {t('badge')}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            style={{
              fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              marginBottom: 32,
              fontFamily: 'Space Grotesk',
              letterSpacing: '-0.03em',
              color: '#F0EBE0',
            }}
          >
            {t('heroTitle1')}{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8B6914, #C9A84C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{t('heroTitle2')}</span>
            <br />
            {t('heroTitle3')}{' '}
            <span style={{ color: '#C9A84C' }}>{t('heroTitle4')}</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: '#A09888',
              maxWidth: 520,
              marginBottom: 52,
            }}
          >
            {t('heroDesc')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 80 }}
          >
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Poppins',
                color: '#08080F',
                background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)',
                border: 'none',
                borderRadius: 'var(--radius-full, 999px)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(201, 168, 76, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(201, 168, 76, 0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201, 168, 76, 0.35)';
              }}
            >
              {t('getStarted')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Poppins',
                color: '#F0EBE0',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-full, 999px)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#C9A84C';
                e.currentTarget.style.color = '#C9A84C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#F0EBE0';
              }}
            >
              {t('viewInventory')}
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            style={{
              display: 'flex',
              gap: 56,
              paddingTop: 40,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {[
              { val: '500+', label: t('tonsMonth') },
              { val: '25+', label: t('countries') },
              { val: '99.2%', label: t('qualityRate') },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontSize: 34,
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk',
                  color: '#C9A84C',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {s.val}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: '#8A8070',
                  fontFamily: 'Poppins',
                  marginTop: 10,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{
          fontSize: 10, letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#8A8070',
          fontFamily: 'Poppins',
        }}>
          {t('scrollExplore')}
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 24, height: 40, borderRadius: 12,
            border: '1.5px solid #8A8070',
            display: 'flex', justifyContent: 'center', paddingTop: 8,
          }}
        >
          <div style={{ width: 3, height: 8, borderRadius: 2, background: '#C9A84C' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
