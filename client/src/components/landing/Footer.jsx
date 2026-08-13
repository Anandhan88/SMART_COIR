'use client';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t('products')]: [
      { name: t('coirRope'), href: '#products' },
      { name: t('coirYarn'), href: '#products' },
      { name: t('fiberBundles'), href: '#products' },
      { name: t('rawFiber'), href: '#products' },
    ],
    [t('company')]: [
      { name: t('aboutUs'), href: '#about' },
      { name: t('manufacturing'), href: '#process' },
      { name: t('qualityStandards'), href: '#' },
      { name: t('careers'), href: '#' },
    ],
    [t('platform')]: [
      { name: t('clientPortal'), href: '/login' },
      { name: t('adminDashboard'), href: '/login' },
      { name: t('inventorySystem'), href: '/login' },
      { name: t('orderTracking'), href: '/login' },
    ],
    [t('support')]: [
      { name: t('contactUs'), href: '#contact' },
      { name: t('documentation'), href: '#' },
      { name: t('faq'), href: '#' },
      { name: t('liveChat'), href: '#' },
    ],
  };

  return (
    <footer id="contact" style={{ background: 'var(--bg-secondary)' }}>
      {/* Top divider */}
      <div className="section-divider" />

      {/* Main footer */}
      <div className="container-main" style={{ paddingTop: 100, paddingBottom: 48 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 48,
          marginBottom: 80,
        }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link 
              href="/" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 14, 
                marginBottom: 28,
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
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                Smart<span style={{ color: 'var(--accent)' }}>Coir</span>
              </div>
            </Link>

            <p style={{
              fontSize: 14, lineHeight: 1.8,
              color: 'var(--text-3)',
              maxWidth: 300, marginBottom: 32,
            }}>
              {t('footerDesc')}
            </p>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📍', text: 'Dharmapuri, Tamil Nadu, India 635111' },
                { icon: '📞', text: '+91 93455 41664' },
                { icon: '✉️', text: 'smartcoir@gmail.com' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-2)' }}>
                  <span style={{ fontSize: 16 }}>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontSize: 12, fontWeight: 600,
                letterSpacing: 3, textTransform: 'uppercase',
                color: 'var(--text-1)',
                fontFamily: 'Poppins',
                marginBottom: 28,
              }}>
                {title}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: 'var(--text-3)',
                        transition: 'color 0.3s',
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 36,
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            © 2025 Smart Coir Manufacturing. {t('rights')}
          </p>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#" style={{ fontSize: 12, color: 'var(--text-3)', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
            >
              {t('privacyPolicy')}
            </a>
            <a href="#" style={{ fontSize: 12, color: 'var(--text-3)', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
            >
              {t('termsOfService')}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
