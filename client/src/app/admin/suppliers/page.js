'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

const mockSuppliers = [
  { company: 'Kerala Husks Co.', contact: 'Mohan Lal', items: 'Raw Coconut Husks', rating: '⭐️ 4.8' },
  { company: 'Pollachi Fiber Suppliers', contact: 'Vijay Sundar', items: 'Decorticated Green Husks', rating: '⭐️ 4.5' },
];

export default function SupplierDirectory() {
  const { t } = useLanguage();

  const getSuppliesTranslation = (items) => {
    switch (items) {
      case 'Raw Coconut Husks': return t('rawCoconutHusks');
      case 'Decorticated Green Husks': return t('decorticatedGreenHusks');
      default: return items;
    }
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('suppliersDirectory')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('suppliersDirectoryDesc')}
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
        }}
      >
        <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(45, 106, 79, 0.1)', border: '1px solid rgba(45, 106, 79, 0.2)', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2D6A4F', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Poppins' }}>
            {t('supplyChainVendorsLabel')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockSuppliers.map((s, i) => (
            <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.01)', border: '1px solid rgba(0, 0, 0, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.company}</div>
                <div style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins', marginTop: '4px' }}>{t('contactColon')} {s.contact} • {t('suppliesColon')} {getSuppliesTranslation(s.items)}</div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#2D6A4F' }}>
                {s.rating}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
