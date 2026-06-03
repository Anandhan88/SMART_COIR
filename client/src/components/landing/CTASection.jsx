'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function CTASection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('feat1Title'),
      desc: t('feat1Desc'),
      icon: '📊',
    },
    {
      title: t('feat2Title'),
      desc: t('feat2Desc'),
      icon: '🤖',
    },
    {
      title: t('feat3Title'),
      desc: t('feat3Desc'),
      icon: '🔗',
    },
    {
      title: t('feat4Title'),
      desc: t('feat4Desc'),
      icon: '🛡️',
    },
  ];

  return (
    <section
      id="about"
      style={{
        padding: '180px 0',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top divider */}
      <div className="section-divider" />

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', top: '20%', right: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(80px)',
      }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 2, paddingTop: 60 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 100,
          alignItems: 'center',
        }}
          className="cta-grid"
        >
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="label-accent" style={{ marginBottom: 24 }}>{t('whyChooseUs')}</div>

            <h2 style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: 28,
            }}>
              {t('futureCoirTitle')}{' '}
              <span className="text-gradient">{t('coirMfg')}</span>
            </h2>

            <p style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: 'var(--text-2)',
              marginBottom: 48,
              maxWidth: 480,
            }}>
              {t('ctaLeftDesc')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Link href="/login" className="btn-gold">
                {t('startFreeTrial')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#contact" className="btn-ghost">
                {t('scheduleDemo')}
              </a>
            </div>
          </motion.div>

          {/* Right — Features grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="card-glass"
                style={{ padding: '32px 28px' }}
              >
                <div style={{
                  fontSize: 32,
                  marginBottom: 18,
                  lineHeight: 1,
                }}>
                  {f.icon}
                </div>
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  color: 'var(--text-1)',
                  marginBottom: 10,
                }}>
                  {f.title}
                </h4>
                <p style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'var(--text-3)',
                }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .cta-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
}
