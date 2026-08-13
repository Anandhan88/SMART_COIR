'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    carrier: 'DHL Express',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: 'Order shipped via logistics partner',
  });
  const [showShipModal, setShowShipModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/orders/${selectedOrder._id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${selectedOrder.orderNumber || selectedOrder._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download invoice PDF.');
    }
  };

  const updateStatus = async (orderId, status, notes = '') => {
    try {
      setActionLoading(true);
      const payload = { status, notes: notes || `Status updated to ${status}` };
      const res = await api.put(`/orders/${orderId}/status`, payload);
      if (res.data.success) {
        // Refresh orders and update selected order details
        await fetchOrders();
        // re-select updated order
        const updated = res.data.data;
        setSelectedOrder(prev => (prev?._id === orderId ? { ...prev, ...updated } : prev));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!shippingForm.trackingNumber) {
      alert('Please enter a tracking number.');
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        status: 'shipped',
        notes: shippingForm.notes,
        carrier: shippingForm.carrier,
        trackingNumber: shippingForm.trackingNumber,
        estimatedDelivery: shippingForm.estimatedDelivery || undefined,
      };
      const res = await api.put(`/orders/${selectedOrder._id}/status`, payload);
      if (res.data.success) {
        setShowShipModal(false);
        setShippingForm({ carrier: 'DHL Express', trackingNumber: '', estimatedDelivery: '', notes: 'Order shipped via logistics partner' });
        await fetchOrders();
        setSelectedOrder(res.data.data);
      }
    } catch (err) {
      console.error('Error shipping order:', err);
      alert('Failed to update shipping logistics details.');
    } finally {
      setActionLoading(false);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/orders/${orderId}/payment`, { paymentStatus });
      if (res.data.success) {
        await fetchOrders();
        const updated = res.data.data;
        setSelectedOrder(prev => (prev?._id === orderId ? { ...prev, ...updated } : prev));
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status.');
    } finally {
      setActionLoading(false);
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

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          {t('logisticsClientPurchases')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('opsOrdersDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px' }} className="admin-orders-grid">
        
        {/* Left Side: Orders List */}
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
              {t('loadingOpsLogs')}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ color: '#8E8E9A', fontSize: '14px', textAlign: 'center', padding: '60px' }}>
              {t('noOrdersInSystem')}
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
                        {order.client?.company || t('directClient')} • {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '13px', color: '#5C5C6B', fontWeight: 500 }}>
                        ₹{order.grandTotal?.toLocaleString('en-IN')} • {order.paymentStatus === 'paid' ? `🟢 ${t('paidStatus')}` : `🔴 ${t('unpaidStatus')}`}
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

        {/* Right Side: Order details & Action controls */}
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
              {/* Header */}
              <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E' }}>
                    {t('processOrderTitle')} #{selectedOrder.orderNumber || selectedOrder._id.substring(0,8).toUpperCase()}
                  </h4>
                  <button
                    onClick={handleDownloadPDF}
                    style={{
                      background: 'rgba(45, 106, 79, 0.1)',
                      border: '1px solid #2D6A4F',
                      color: '#2D6A4F',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'Poppins',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(45, 106, 79, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(45, 106, 79, 0.1)';
                    }}
                  >
                    📄 {t('downloadInvoice')}
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#5C5C6B', fontFamily: 'Poppins' }}>
                  {t('clientLabel')} <strong>{selectedOrder.client?.name}</strong> ({selectedOrder.client?.company})
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontFamily: 'Poppins' }}>
                  {t('workflowStatusActions')}
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  
                  {selectedOrder.status === 'pending' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => updateStatus(selectedOrder._id, 'confirmed')}
                      style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(45, 106, 79,0.1)', border: '1px solid #2D6A4F', color: '#2D6A4F', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      ✓ {t('confirmOrderBtn')}
                    </button>
                  )}

                  {selectedOrder.status === 'confirmed' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => updateStatus(selectedOrder._id, 'processing')}
                      style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', color: '#3498db', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      {t('beginProcessingBtn')}
                    </button>
                  )}

                  {['confirmed', 'processing'].includes(selectedOrder.status) && (
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowShipModal(true)}
                      style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(155, 89, 182, 0.1)', border: '1px solid #9b59b6', color: '#9b59b6', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      {t('shipBtn')}
                    </button>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => updateStatus(selectedOrder._id, 'delivered')}
                      style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      {t('markDeliveredBtn')}
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Actions */}
              <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '24px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontFamily: 'Poppins' }}>
                  {t('billingPaymentStatus')}
                </h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', fontFamily: 'Poppins', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#8E8E9A' }}>{t('paymentStatusLabel')} </span>
                    <strong style={{ color: selectedOrder.paymentStatus === 'paid' ? '#2ecc71' : '#D00000' }}>
                      {selectedOrder.paymentStatus === 'paid' ? t('paidStatus').toUpperCase() : t('unpaidStatus').toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    {selectedOrder.paymentStatus !== 'paid' ? (
                      <button
                        disabled={actionLoading}
                        onClick={() => updatePaymentStatus(selectedOrder._id, 'paid')}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                      >
                        💵 {t('approvePaymentBtn')}
                      </button>
                    ) : (
                      <button
                        disabled={actionLoading}
                        onClick={() => updatePaymentStatus(selectedOrder._id, 'unpaid')}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #D00000', color: '#D00000', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                      >
                        {t('resetUnpaidBtn')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '24px', fontSize: '13px', fontFamily: 'Poppins' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {t('deliveryAddress')}
                </h5>
                <p style={{ color: '#1A1A2E', lineHeight: 1.5 }}>{selectedOrder.shippingAddress}</p>
              </div>

              {/* Items List */}
              <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.03)', paddingBottom: '20px', marginBottom: '24px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontFamily: 'Poppins' }}>
                  {t('purchasedItems')}
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: 'Poppins' }}>
                      <div>
                        <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{item.product?.name || 'Coir Item'}</span>
                        <div style={{ fontSize: '12px', color: '#8E8E9A' }}>{t('quantityLabel')} {item.quantity} kg</div>
                      </div>
                      <strong style={{ color: '#2D6A4F' }}>₹{(item.totalPrice || item.quantity * item.unitPrice).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('subtotal')}</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('estimatedGst')}</span>
                  <span>₹{(selectedOrder.tax || selectedOrder.totalAmount * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('shippingLogistics')}</span>
                  <span>₹{(selectedOrder.shippingCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.03)', paddingTop: '8px', fontWeight: 600, fontSize: '16px', color: '#2D6A4F' }}>
                  <span>{t('grandTotal')}</span>
                  <span>₹{selectedOrder.grandTotal?.toLocaleString('en-IN')}</span>
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

      {/* Shipping Details Modal */}
      <AnimatePresence>
        {showShipModal && (
          <>
            <div onClick={() => setShowShipModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: '420px', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.04)',
                borderRadius: '20px', padding: '28px', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '16px', color: '#2D6A4F' }}>
                {t('enterShippingDetailsTitle')}
              </h3>
              <form onSubmit={handleShipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('logisticsCarrierLabel')}</label>
                  <input
                    type="text"
                    value={shippingForm.carrier}
                    onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                    required
                    style={{
                      padding: '10px 14px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('trackingNumberLabel')}</label>
                  <input
                    type="text"
                    value={shippingForm.trackingNumber}
                    onChange={(e) => setShippingForm({ ...shippingForm, trackingNumber: e.target.value })}
                    placeholder="E.g. TRK9876543210"
                    required
                    style={{
                      padding: '10px 14px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8E8E9A', fontFamily: 'Poppins' }}>{t('estimatedDeliveryDateLabel')}</label>
                  <input
                    type="date"
                    value={shippingForm.estimatedDelivery}
                    onChange={(e) => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })}
                    style={{
                      padding: '10px 14px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)', color: '#1A1A2E', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowShipModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(0, 0, 0, 0.05)', color: '#5C5C6B', cursor: 'pointer', fontSize: '13px' }}>{t('cancelBtn')}</button>
                  <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #95D5B2 100%)', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '13px' }}>{t('dispatchOrderBtn')}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .admin-orders-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
