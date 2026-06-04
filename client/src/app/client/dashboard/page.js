'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        const fetchedOrders = res.data.data;
        setOrders(fetchedOrders);
        
        // Compute statistics
        const total = fetchedOrders.length;
        const active = fetchedOrders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length;
        const completed = fetchedOrders.filter(o => o.status === 'delivered').length;
        const spent = fetchedOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        
        setStats({
          totalOrders: total,
          activeOrders: active,
          completedOrders: completed,
          totalSpent: spent,
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F5F0',
        color: '#1A1A2E',
        fontFamily: 'Poppins',
      }}>
        {t('loadingDashboard')}
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { text: '#E8C55A', bg: 'rgba(232, 197, 90, 0.1)' };
      case 'confirmed': return { text: '#2D6A4F', bg: 'rgba(45, 106, 79, 0.1)' };
      case 'processing': return { text: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' };
      case 'shipped': return { text: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)' };
      case 'delivered': return { text: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)' };
      default: return { text: '#5C5C6B', bg: 'rgba(0, 0, 0, 0.03)' };
    }
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.04) 0%, rgba(27, 67, 50, 0.02) 100%)',
          border: '1px solid rgba(45, 106, 79, 0.08)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
            {t('welcome')}, {user.name} 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#5C5C6B', fontFamily: 'Poppins' }}>
            {t('repOf')} <strong style={{ color: '#2D6A4F' }}>{user.company || 'Direct Buyer'}</strong>. {t('manageCoirOrders')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/client/inventory" className="btn-gold" style={{ padding: '12px 24px', fontSize: '13px', textDecoration: 'none' }}>
            {t('browseCatalog')}
          </Link>
          <Link href="/client/orders" className="btn-ghost" style={{ padding: '12px 24px', fontSize: '13px', textDecoration: 'none' }}>
            {t('orderHistory')}
          </Link>
        </div>
      </motion.div>

      {/* Stats Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {[
          { label: t('totalOrdersPlaced'), val: stats.totalOrders, icon: '📦', color: '#5C5C6B' },
          { label: t('activeShipments'), val: stats.activeOrders, icon: '🚚', color: '#2D6A4F' },
          { label: t('completedDeliveries'), val: stats.completedOrders, icon: '✅', color: '#2ecc71' },
          { label: t('totalInvestments'), val: `₹${stats.totalSpent.toLocaleString('en-IN')}`, icon: '💰', color: '#2D6A4F' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i }}
            style={{
              background: 'rgba(0, 0, 0, 0.01)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.03)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E' }}>
                {s.val}
              </div>
            </div>
            <div style={{ fontSize: '32px' }}>{s.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Section split: Recent Orders & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px' }} className="grid-responsive">
        
        {/* Left Side: Recent Orders Table */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.01)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          borderRadius: '20px',
          padding: '28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
              {t('recentOrders')}
            </h3>
            <Link href="/client/orders" style={{ fontSize: '13px', color: '#2D6A4F', textDecoration: 'none' }}>
              {t('viewAllOrders')} →
            </Link>
          </div>

          {ordersLoading ? (
            <div style={{ color: '#8E8E9A', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
              {t('loadingRecentOrders')}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#8E8E9A', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
              {t('noOrdersFoundClickHere')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', color: '#8E8E9A' }}>
                    <th style={{ padding: '12px 8px' }}>{t('orderRef')}</th>
                    <th style={{ padding: '12px 8px' }}>{t('items')}</th>
                    <th style={{ padding: '12px 8px' }}>{t('totalAmount')}</th>
                    <th style={{ padding: '12px 8px' }}>{t('status')}</th>
                    <th style={{ padding: '12px 8px' }}>{t('date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => {
                    const st = getStatusColor(order.status);
                    return (
                      <tr key={order._id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.02)', color: '#1A1A2E' }}>
                        <td style={{ padding: '16px 8px', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                          #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                        </td>
                        <td style={{ padding: '16px 8px', color: '#5C5C6B' }}>
                          {order.items?.length || 1} {t('productsUnit')}
                        </td>
                        <td style={{ padding: '16px 8px', fontWeight: 500 }}>
                          ₹{(order.grandTotal || order.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: st.bg,
                            color: st.text,
                            border: `1px solid ${st.text}20`,
                          }}>
                            {t('status' + order.status.charAt(0).toUpperCase() + order.status.slice(1))}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', color: '#8E8E9A', fontSize: '12px' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Actions & Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.01)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.03)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '16px', color: '#2D6A4F' }}>
              {t('quickActions')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/client/inventory" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5C5C6B', fontSize: '13px', textDecoration: 'none', padding: '10px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.01)' }} onMouseEnter={(e)=>e.target.style.color='#1A1A2E'} onMouseLeave={(e)=>e.target.style.color='#5C5C6B'}>
                {t('orderCoirProducts')}
              </Link>
              <Link href="/client/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5C5C6B', fontSize: '13px', textDecoration: 'none', padding: '10px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.01)' }} onMouseEnter={(e)=>e.target.style.color='#1A1A2E'} onMouseLeave={(e)=>e.target.style.color='#5C5C6B'}>
                {t('updateCompanyProfile')}
              </Link>
              <Link href="/client/contact" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5C5C6B', fontSize: '13px', textDecoration: 'none', padding: '10px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.01)' }} onMouseEnter={(e)=>e.target.style.color='#1A1A2E'} onMouseLeave={(e)=>e.target.style.color='#5C5C6B'}>
                {t('supportInquiry')}
              </Link>
            </div>
          </div>

          {/* Help Box */}
          <div style={{
            background: 'rgba(45, 106, 79, 0.02)',
            border: '1px solid rgba(45, 106, 79, 0.08)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '8px', color: '#2D6A4F' }}>
              {t('needAssistance')}
            </h4>
            <p style={{ fontSize: '12px', color: '#8E8E9A', lineHeight: 1.6, marginBottom: '16px', fontFamily: 'Poppins' }}>
              {t('assistanceDesc')}
            </p>
            <Link href="/client/contact" className="btn-ghost" style={{ padding: '8px 16px', fontSize: '11px', display: 'inline-block', textDecoration: 'none' }}>
              {t('inquireNow')}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
