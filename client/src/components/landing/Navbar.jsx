'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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

  const navBg = scrolled ? 'rgba(8, 8, 15, 0.8)' : 'transparent';
  const langLabels = { en: '🇬🇧 EN', ta: '🇮🇳 தமிழ்', hi: '🇮🇳 हिन्दी' };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '14px 0' : '24px 0',
        background: navBg,
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201, 168, 76, 0.08)' : 'none',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="container-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            outline: 'none',
            border: 'none',
            textDecoration: 'none'
          }}
        >
          <img
            src="/images/coconut_tree_logo.png?v=2"
            alt="Smart Coir Logo"
            style={{ width: 40, height: 40, objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--text-1)', lineHeight: 1.2 }}>
              Smart<span style={{ color: 'var(--accent)' }}>Coir</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'Poppins' }}>
              Manufacturing
            </div>
          </div>
        </Link>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              style={{
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Poppins',
                color: 'var(--text-2)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {langLabels[lang]}
              <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
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
                    background: 'rgba(14, 14, 24, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
                        color: lang === item.code ? 'var(--accent)' : 'var(--text-1)',
                        background: lang === item.code
                          ? 'rgba(201, 168, 76, 0.08)'
                          : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        if (lang !== item.code) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (lang !== item.code) e.currentTarget.style.background = 'transparent';
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
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Poppins',
              color: '#F0EBE0',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = '#F0EBE0';
            }}
          >
            {t('login')}
          </button>

          {/* Get Started Button */}
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'Poppins',
              color: '#08080F',
              background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 168, 76, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(201, 168, 76, 0.3)';
            }}
          >
            {t('getStarted')} →
          </button>
        </div>
      </div>
    </motion.header>
  );
}
