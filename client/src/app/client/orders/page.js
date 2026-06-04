'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClientOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Status timeline mapping helper
  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('orderHistory')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('manageCoirOrders')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="orders-grid">
        
        {/* Left Column: Orders list */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.01)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          borderRadius: '20px',
          padding: '28px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '24px' }}>
            {t('incomingOrdersTitle')}
          </h3>

          {loading ? (
            <div style={{ color: '#8E8E9A', fontSize: '14px', textAlign: 'center', padding: '60px' }}>
              {t('loadingRecentOrders')}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#8E8E9A', fontSize: '14px', textAlign: 'center', padding: '60px' }}>
              {t('noOrders')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => {
                const st = getStatusColor(order.status);
                const isSelected = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(45, 106, 79, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                      border: isSelected ? '1px solid #2D6A4F' : '1px solid rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(45, 106, 79, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.03)';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '4px' }}>
                        #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins', marginBottom: '6px' }}>
                        {t('date')}: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '13px', color: '#5C5C6B', fontWeight: 500 }}>
                        {order.items?.length || 1} {t('productsUnit')} • ₹{(order.grandTotal || order.totalAmount).toLocaleString('en-IN')}
                      </div>
                    </div>

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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Order Detail & Tracking Timeline */}
        <div>
          {selectedOrder ? (
            <motion.div
              key={selectedOrder._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(0, 0, 0, 0.015)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.03)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
              }}
            >
              {/* Order Detail Header */}
              <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E' }}>
                    {t('productDetails')}
                  </h4>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: getStatusColor(selectedOrder.status).bg,
                    color: getStatusColor(selectedOrder.status).text,
                  }}>
                    {t('status' + selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1))}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#8E8E9A', fontFamily: 'Poppins' }}>
                  Reference: #{selectedOrder.orderNumber || selectedOrder._id.toUpperCase()}
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ marginBottom: '32px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', fontFamily: 'Poppins' }}>
                  {t('estimatedDelivery')}
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                  
                  {/* Timeline Bar Background */}
                  <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', height: '3px', background: 'rgba(0, 0, 0, 0.03)', zIndex: 1 }} />
                  
                  {/* Timeline Bar Fill */}
                  <div style={{
                    position: 'absolute', top: '10px', left: '20px',
                    width: `${(getStatusStep(selectedOrder.status) / 4) * 85}%`,
                    height: '3px', background: '#2D6A4F', zIndex: 2
                  }} />

                  {/* Steps */}
                  {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((stepName, idx) => {
                    const stepIdx = getStatusStep(selectedOrder.status);
                    const isDone = idx <= stepIdx;
                    const isCurrent = idx === stepIdx;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5, position: 'relative' }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: isDone ? '#2D6A4F' : '#FFFFFF',
                          border: isDone ? 'none' : '2px solid rgba(0, 0, 0, 0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isDone ? '#F8F5F0' : '#8E8E9A', fontSize: '10px', fontWeight: 800,
                          boxShadow: isCurrent ? '0 0 10px #2D6A4F' : 'none'
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '9px', marginTop: '6px', fontWeight: isDone ? 600 : 400, color: isDone ? '#2D6A4F' : '#8E8E9A', fontFamily: 'Poppins' }}>
                          {t('status' + stepName)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '20px', marginBottom: '24px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontFamily: 'Poppins' }}>
                  {t('purchasedItems')}
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: 'Poppins' }}>
                      <div>
                        <div style={{ color: '#1A1A2E', fontWeight: 500 }}>{item.product?.name || 'Coir Product'}</div>
                        <div style={{ fontSize: '12px', color: '#8E8E9A' }}>{t('quantityLabel')} {item.quantity} kg</div>
                      </div>
                      <span style={{ color: '#2D6A4F', fontWeight: 600 }}>₹{item.totalPrice?.toLocaleString('en-IN') || (item.quantity * item.unitPrice).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logistics & Tracking info */}
              {selectedOrder.deliveryTracking && selectedOrder.deliveryTracking.trackingNumber && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.01)', borderRadius: '12px', padding: '16px', fontSize: '13px',
                  fontFamily: 'Poppins', border: '1px solid rgba(0, 0, 0, 0.015)', marginBottom: '24px'
                }}>
                  <h5 style={{ fontSize: '11px', fontWeight: 600, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {t('shippingLogistics')}
                  </h5>
                  <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#8E8E9A' }}>{t('logisticsCarrierLabel')}</span>
                    <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{selectedOrder.deliveryTracking.carrier}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#8E8E9A' }}>{t('trackingNumberLabel')}</span>
                    <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{selectedOrder.deliveryTracking.trackingNumber}</span>
                  </div>
                  {selectedOrder.deliveryTracking.estimatedDelivery && (
                    <div style={{ display: 'flex', justify: 'space-between' }}>
                      <span style={{ color: '#8E8E9A' }}>{t('estimatedDeliveryDateLabel')}</span>
                      <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{new Date(selectedOrder.deliveryTracking.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Grand Billing Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span>{t('subtotal')}</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span>{t('estimatedGst')}</span>
                  <span>₹{(selectedOrder.tax || selectedOrder.totalAmount * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span>{t('shippingLogistics')}</span>
                  <span>₹{(selectedOrder.shippingCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.03)', paddingTop: '8px', fontWeight: 600, fontSize: '16px', color: '#2D6A4F' }}>
                  <span>{t('grandTotal')}</span>
                  <span>₹{selectedOrder.grandTotal?.toLocaleString('en-IN') || selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{
              background: 'rgba(0, 0, 0, 0.01)',
              border: '1px solid rgba(0, 0, 0, 0.02)',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#8E8E9A',
              fontSize: '14px',
              fontFamily: 'Poppins',
            }}>
              {t('selectOrderProcessDesc')}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .orders-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
