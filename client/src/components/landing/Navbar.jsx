'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = () => setLangOpen(false);
    if (langOpen) {
      setTimeout(() => document.addEventListener('click', handleClick), 0);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [langOpen]);

  const navBg = scrolled ? 'rgba(248, 245, 240, 0.95)' : 'transparent';
  const langLabels = { en: '🇬🇧 EN', ta: '🇮🇳 தமிழ்', hi: '🇮🇳 हिन्दी' };
  const compactLangLabels = { en: '🇬🇧 EN', ta: '🇮🇳 TA', hi: '🇮🇳 HI' };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '12px 0' : '18px 0',
        background: mobileOpen ? (scrolled ? 'rgba(248, 245, 240, 0.98)' : 'rgba(8, 8, 15, 0.98)') : navBg,
        backdropFilter: scrolled || mobileOpen ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="container-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            outline: 'none',
            border: 'none',
            textDecoration: 'none',
            zIndex: 110,
            flexShrink: 0,
          }}
        >
          <img
            src="/images/coconut_tree_logo.png?v=2"
            alt="Smart Coir Logo"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: scrolled ? '#111122' : '#FFFFFF', lineHeight: 1.1, transition: 'color 0.3s ease' }}>
              Smart<span style={{ color: scrolled ? '#2D6A4F' : '#52B788', transition: 'color 0.3s ease' }}>Coir</span>
            </div>
            <div style={{ fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: scrolled ? '#737380' : 'rgba(255, 255, 255, 0.7)', fontFamily: 'Poppins', transition: 'color 0.3s ease' }}>
              Manufacturing
            </div>
          </div>
        </Link>

        {/* Desktop Controls */}
        <div className="nav-desktop-controls" style={{ alignItems: 'center', gap: 10 }}>
          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              style={{
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Poppins',
                color: scrolled ? '#5C5C6B' : '#FFFFFF',
                background: scrolled ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.15)',
                border: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {langLabels[lang]}
              <span style={{ fontSize: 10, opacity: scrolled ? 0.6 : 0.9 }}>▼</span>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'rgba(248, 245, 240, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    minWidth: 140,
                    zIndex: 200,
                  }}
                >
                  {[
                    { code: 'en', label: '🇬🇧  English' },
                    { code: 'ta', label: '🇮🇳  தமிழ் (Tamil)' },
                    { code: 'hi', label: '🇮🇳  हिन्दी (Hindi)' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={(e) => { e.stopPropagation(); setLang(item.code); setLangOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: 13,
                        fontFamily: 'Poppins',
                        fontWeight: lang === item.code ? 600 : 400,
                        color: lang === item.code ? '#2D6A4F' : '#1A1A2E',
                        background: lang === item.code ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login Button */}
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Poppins',
              color: scrolled ? '#1A1A2E' : '#FFFFFF',
              background: 'transparent',
              border: scrolled ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {t('login')}
          </button>

          {/* Get Started Button */}
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Poppins',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(45, 106, 79, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('getStarted')} →
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="nav-mobile-controls" style={{ alignItems: 'center', gap: 8, zIndex: 110 }}>
          {/* Compact Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              style={{
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Poppins',
                color: scrolled || mobileOpen ? (scrolled ? '#1A1A2E' : '#FFFFFF') : '#FFFFFF',
                background: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.18)',
                border: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {compactLangLabels[lang]}
              <span style={{ fontSize: 9 }}>▼</span>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'rgba(248, 245, 240, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    minWidth: 130,
                    zIndex: 250,
                  }}
                >
                  {[
                    { code: 'en', label: '🇬🇧  English' },
                    { code: 'ta', label: '🇮🇳  தமிழ்' },
                    { code: 'hi', label: '🇮🇳  हिन्दी' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={(e) => { e.stopPropagation(); setLang(item.code); setLangOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: 12,
                        fontFamily: 'Poppins',
                        fontWeight: lang === item.code ? 600 : 400,
                        color: lang === item.code ? '#2D6A4F' : '#1A1A2E',
                        background: lang === item.code ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: scrolled ? (mobileOpen ? '#1A1A2E' : '#1A1A2E') : '#FFFFFF',
              background: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.18)',
              border: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              overflow: 'hidden',
              background: scrolled ? '#F8F5F0' : '#08080F',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            className="nav-mobile-drawer"
          >
            <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Link
                href="#products"
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, fontWeight: 500, color: scrolled ? '#1A1A2E' : '#E0E0E0', fontFamily: 'Poppins' }}
              >
                {t('products')}
              </Link>
              <Link
                href="#process"
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, fontWeight: 500, color: scrolled ? '#1A1A2E' : '#E0E0E0', fontFamily: 'Poppins' }}
              >
                {t('manufacturing')}
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, fontWeight: 500, color: scrolled ? '#1A1A2E' : '#E0E0E0', fontFamily: 'Poppins' }}
              >
                {t('contactUs')}
              </Link>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { setMobileOpen(false); router.push('/login'); }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'Poppins',
                    color: scrolled ? '#1A1A2E' : '#FFFFFF',
                    background: 'transparent',
                    border: scrolled ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => { setMobileOpen(false); router.push('/login'); }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'Poppins',
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(45, 106, 79, 0.3)',
                  }}
                >
                  {t('getStarted')} →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .nav-desktop-controls { display: flex !important; }
          .nav-mobile-controls { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop-controls { display: none !important; }
          .nav-mobile-controls { display: flex !important; }
          .nav-mobile-drawer { display: block !important; }
        }
      `}</style>
    </motion.header>
  );
}
