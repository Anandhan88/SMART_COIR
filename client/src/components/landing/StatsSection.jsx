'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

function Counter({ end, suffix = '', duration = 2.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let frame;
    let start = 0;
    const step = end / (duration * 60);
    const animate = () => {
      start += step;
      if (start >= end) { setCount(end); return; }
      setCount(Math.floor(start * 10) / 10);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);

  return <span ref={ref}>{Number.isInteger(end) ? Math.floor(count) : count.toFixed(1)}{suffix}</span>;
}

export default function StatsSection() {
  const { t } = useLanguage();
  const stats = [
    { value: 500, suffix: '+', label: t('tonsProducedMonthly'), desc: t('highCapacityMfg'), icon: '🏭' },
    { value: 25, suffix: '+', label: t('exportCountries'), desc: t('globalCoverage'), icon: '🌍' },
    { value: 150, suffix: '+', label: t('activeClients'), desc: t('trustedPartnerships'), icon: '🤝' },
    { value: 99.2, suffix: '%', label: t('qualityAssurance'), desc: t('isoCertified'), icon: '✅' },
  ];

  return (
    <section style={{ padding: '140px 0', background: 'var(--bg-secondary)' }}>
      {/* Top divider */}
      <div className="section-divider" />

      <div className="container-main" style={{ paddingTop: 80 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div className="label-accent" style={{ marginBottom: 20 }}>{t('ourImpact')}</div>
          <h2 className="section-title" style={{ maxWidth: 600, margin: '0 auto 20px' }}>
            {t('industryLeading')} <span className="text-gradient">{t('performance')}</span>
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            {t('statsDesc')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-glass"
              style={{ padding: '48px 36px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 40, marginBottom: 20, lineHeight: 1 }}>{stat.icon}</div>
              <div style={{
                fontSize: 48, fontWeight: 800,
                fontFamily: 'Space Grotesk',
                color: 'var(--accent)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: 12,
              }}>
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: 'var(--text-1)',
                fontFamily: 'Poppins',
                marginBottom: 8,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--text-3)',
                lineHeight: 1.5,
              }}>
                {stat.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
