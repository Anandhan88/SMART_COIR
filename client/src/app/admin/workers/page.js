'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';

const mockWorkers = [
  { name: 'Ramesh Kumar', role: 'Machine Operator', dept: 'Decortication Unit', status: 'Active' },
  { name: 'Anjali Sharma', role: 'Quality Auditor', dept: 'Inspection Department', status: 'Active' },
  { name: 'Siva Prakash', role: 'Logistics Handler', dept: 'Warehouse A', status: 'On Leave' },
];

export default function WorkerDirectory() {
  const { t } = useLanguage();

  const getRoleTranslation = (role) => {
    switch (role) {
      case 'Machine Operator': return t('machineOperator');
      case 'Quality Auditor': return t('qualityAuditor');
      case 'Logistics Handler': return t('logisticsHandler');
      default: return role;
    }
  };

  const getDeptTranslation = (dept) => {
    switch (dept) {
      case 'Decortication Unit': return t('decorticationUnit');
      case 'Inspection Department': return t('inspectionDept');
      case 'Warehouse A': return t('warehouseA');
      default: return dept;
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Active': return t('activeStatus');
      case 'On Leave': return t('onLeaveStatus');
      default: return status;
    }
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('workersDirectory')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('workersDirectoryDesc')}
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
            {t('shiftOpsLabel')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockWorkers.map((w, i) => (
            <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.01)', border: '1px solid rgba(0, 0, 0, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{w.name}</div>
                <div style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins', marginTop: '4px' }}>{getRoleTranslation(w.role)} • {getDeptTranslation(w.dept)}</div>
              </div>
              <span style={{ fontSize: '12px', color: w.status === 'Active' ? '#2ecc71' : '#E8C55A', fontWeight: 500 }}>
                ● {getStatusTranslation(w.status)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
