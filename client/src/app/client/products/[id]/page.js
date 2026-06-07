'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useLanguage } from '../../../../context/LanguageContext';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(500); // Default order quantity (e.g. 500kg)
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank-transfer');
  const [notes, setNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrExpanded, setQrExpanded] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Unpack dynamic router params
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setProductId(resolved.id);
    }
    resolveParams();
  }, [params]);

  // Fetch product detail when ID is ready
  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setErrorMessage(t('couldNotLoadDetails'));
    } finally {
      setLoading(false);
    }
  };

  // Math helper for cost breakdown
  const calculateBilling = () => {
    if (!product) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    const subtotal = orderQuantity * product.price.amount;
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 50000 ? 0 : 2000;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!shippingAddress) {
      setErrorMessage(t('provideAddress'));
      return;
    }
    if (paymentMethod === 'upi' && !paymentVerified) {
      setUpiModalOpen(true);
      return;
    }
    setSubmittingOrder(true);
    setErrorMessage('');
    try {
      const orderPayload = {
        items: [
          {
            product: product._id,
            quantity: orderQuantity,
            unitPrice: product.price.amount
          }
        ],
        shippingAddress,
        notes,
        paymentMethod
      };
      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        setOrderSuccess(true);
        setTimeout(() => {
          router.push('/client/orders');
        }, 2500);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('inquirySubmittedError'));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSimulatePayment = async () => {
    setSimulatingPayment(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPaymentVerified(true);
      setSimulatingPayment(false);
      await submitVerifiedOrder();
    } catch (err) {
      console.error(err);
      setSimulatingPayment(false);
      setErrorMessage('UPI Payment Verification Failed.');
    }
  };

  const submitVerifiedOrder = async () => {
    setSubmittingOrder(true);
    setErrorMessage('');
    try {
      const orderPayload = {
        items: [
          {
            product: product._id,
            quantity: orderQuantity,
            unitPrice: product.price.amount
          }
        ],
        shippingAddress,
        notes,
        paymentMethod: 'upi'
      };
      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        setOrderSuccess(true);
        setUpiModalOpen(false);
        setTimeout(() => {
          router.push('/client/orders');
        }, 2500);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('inquirySubmittedError'));
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading || !productId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justify: 'center', background: '#F8F5F0', color: '#1A1A2E', fontFamily: 'Poppins' }}>
        {t('loadingSpecs')}
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#F8F5F0', color: '#1A1A2E', fontFamily: 'Poppins' }}>
        <p style={{ color: '#D00000', marginBottom: '20px' }}>{errorMessage}</p>
        <Link href="/client/inventory" className="btn-gold" style={{ textDecoration: 'none' }}>{t('backToInventory')}</Link>
      </div>
    );
  }

  const { subtotal, tax, shipping, total } = calculateBilling();

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Back Button */}
      <Link href="/client/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#5C5C6B', textDecoration: 'none', fontSize: '14px', marginBottom: '32px' }}>
        ← {t('backToInventory')}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }} className="detail-grid">
        
        {/* Left Column: Product Info & Specifications */}
        <div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#2D6A4F', background: 'rgba(45, 106, 79,0.1)', border: '1px solid rgba(45, 106, 79,0.2)', padding: '4px 12px', borderRadius: '10px', textTransform: 'uppercase', fontFamily: 'Poppins' }}>
              {product.qualityGrade} {t('grade')}
            </span>
            <span style={{ fontSize: '11px', color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SKU: {product.sku}
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px' }}>
            {product.name}
          </h1>

          <p style={{ color: '#5C5C6B', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px', fontFamily: 'Poppins' }}>
            {product.description}
          </p>

          {/* Specifications Card */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.01)',
            border: '1px solid rgba(0, 0, 0, 0.03)',
            borderRadius: '16px',
            padding: '24px 32px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.02)', paddingBottom: '8px' }}>
              {t('technicalSpecifications')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', fontSize: '14px', fontFamily: 'Poppins' }}>
              {[
                { label: t('fiberComposition'), val: product.specifications?.fiberType || 'N/A' },
                { label: t('yarnRopeColor'), val: product.specifications?.color || 'N/A' },
                { label: t('moistureLevel'), val: product.specifications?.moistureContent || 'N/A' },
                { label: t('tensileStrength'), val: product.specifications?.tensileStrength || 'N/A' },
                { label: t('lengthPerUnit'), val: product.specifications?.length || 'N/A' },
                { label: t('thicknessDiameter'), val: product.specifications?.diameter || 'N/A' },
              ].map((spec, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 0, 0, 0.015)', paddingBottom: '8px' }}>
                  <span style={{ color: '#8E8E9A' }}>{spec.label}</span>
                  <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{spec.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Inventory Tag */}
          {product.qrCodeUrl && (
            <div style={{
              marginTop: '32px',
              background: 'rgba(0, 0, 0, 0.01)',
              border: '1px solid rgba(0, 0, 0, 0.03)',
              borderRadius: '16px',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#2D6A4F', marginBottom: '8px' }}>
                  {t('qrCodeInventoryTag')}
                </h3>
                <p style={{ fontSize: '12px', color: '#8E8E9A', lineHeight: 1.5, fontFamily: 'Poppins', maxWidth: '280px', margin: 0 }}>
                  {t('qrVerifyDesc')}
                </p>
              </div>
              <div 
                onClick={() => setQrExpanded(true)}
                style={{
                  background: '#fff',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  cursor: 'zoom-in',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={product.qrCodeUrl} 
                  alt="Product QR Tag" 
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Form */}
        <div>
          {orderSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(46, 204, 113, 0.05)',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                borderRadius: '24px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            >
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🎉</span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#2ecc71', marginBottom: '8px' }}>
                {t('orderRequestPlaced')}
              </h2>
              <p style={{ fontSize: '13px', color: '#5C5C6B', fontFamily: 'Poppins', lineHeight: 1.6 }}>
                {t('orderSuccessDesc')}
              </p>
            </motion.div>
          ) : (
            <div style={{
              background: 'rgba(0, 0, 0, 0.015)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.03)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '24px' }}>
                {t('placeOrderRequest')}
              </h3>

              {errorMessage && (
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#D00000', fontSize: '13px', marginBottom: '20px', fontFamily: 'Poppins' }}>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px', fontWeight: 500, fontFamily: 'Poppins' }}>
                    <span style={{ color: '#5C5C6B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('quantityTons')} ({t(product.price.perUnit.toLowerCase())})</span>
                    <span style={{ color: '#2D6A4F' }}>{t('rate')}: ₹{product.price.amount} / {t(product.price.perUnit.toLowerCase())}</span>
                  </div>
                  <input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    required
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Shipping Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#5C5C6B', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('shippingDeliveryAddress')}
                  </label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={t('addressPlaceholder')}
                    required
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#5C5C6B', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('preferredPaymentMethod')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  >
                    <option value="bank-transfer">{t('bankTransferOption')}</option>
                    <option value="upi">{t('upiOption')}</option>
                    <option value="letter-of-credit">{t('lcOption')}</option>
                    <option value="net-30">{t('net30Option')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#5C5C6B', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('orderNotesOptional')}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.015)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      color: '#1A1A2E',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Billing Summary */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.01)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'Poppins',
                  border: '1px solid rgba(0, 0, 0, 0.015)',
                }}>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8E8E9A' }}>{t('subtotal')}</span>
                    <span style={{ color: '#1A1A2E' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8E8E9A' }}>{t('estimatedGst')}</span>
                    <span style={{ color: '#1A1A2E' }}>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8E8E9A' }}>{t('shippingLogistics')}</span>
                    <span style={{ color: '#1A1A2E' }}>{shipping === 0 ? t('free') : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.03)', paddingTop: '8px', fontWeight: 600, fontSize: '15px' }}>
                    <span style={{ color: '#2D6A4F' }}>{t('estimatedTotal')}</span>
                    <span style={{ color: '#2D6A4F' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #95D5B2 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: 'none',
                    cursor: submittingOrder ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(45, 106, 79, 0.2)',
                  }}
                >
                  {submittingOrder ? t('submittingOrderRequest') : t('placeOrderRequest')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Expanded QR Modal */}
      <AnimatePresence>
        {qrExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              cursor: 'zoom-out',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '36px',
                width: '100%',
                maxWidth: '380px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#1A1A2E', margin: 0 }}>
                  {t('qrCodeInventoryTag')}
                </h3>
                <button
                  onClick={() => setQrExpanded(false)}
                  style={{
                    border: 'none',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#8E8E9A',
                    transition: 'background 0.3s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: '#F8F5F0',
                padding: '24px',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.04)',
                marginBottom: '20px',
              }}>
                <img
                  src={product.qrCodeUrl}
                  alt="Product QR Tag"
                  style={{ width: '240px', height: '240px', objectFit: 'contain' }}
                />
              </div>

              <div style={{ fontSize: '13px', color: '#5C5C6B', fontFamily: 'Poppins', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>{product.name}</div>
                <div style={{ fontSize: '11px', color: '#8E8E9A', letterSpacing: '0.5px' }}>SKU: {product.sku}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI QR Modal */}
      <AnimatePresence>
        {upiModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!simulatingPayment) setUpiModalOpen(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '36px',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', margin: 0 }}>
                  UPI QR Payment
                </h3>
                {!simulatingPayment && (
                  <button
                    onClick={() => setUpiModalOpen(false)}
                    style={{
                      border: 'none',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: '#8E8E9A',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {simulatingPayment ? (
                <div style={{ padding: '40px 0' }}>
                  <div className="payment-spinner" style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid rgba(45, 106, 79, 0.1)',
                    borderTopColor: '#2D6A4F',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px auto'
                  }} />
                  <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '15px', fontFamily: 'Poppins' }}>
                    Verifying payment transaction...
                  </div>
                  <div style={{ color: '#8E8E9A', fontSize: '12px', marginTop: '6px', fontFamily: 'Poppins' }}>
                    Do not close or reload the browser.
                  </div>
                </div>
              ) : paymentVerified ? (
                <div style={{ padding: '40px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <div style={{ fontWeight: 600, color: '#2ecc71', fontSize: '16px', fontFamily: 'Poppins' }}>
                    Payment Successful!
                  </div>
                  <div style={{ color: '#8E8E9A', fontSize: '12px', marginTop: '6px', fontFamily: 'Poppins' }}>
                    Creating order in system...
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    background: '#F8F5F0',
                    padding: '20px',
                    borderRadius: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.04)',
                    marginBottom: '20px',
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=pay@smartcoir%26pn=Smart%20Coir%20Ltd%26am=${total}%26cu=INR`}
                      alt="Payment QR Code"
                      style={{ width: '180px', height: '180px', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ fontSize: '14px', fontFamily: 'Poppins', color: '#5C5C6B', marginBottom: '24px', textAlign: 'left', background: 'rgba(0,0,0,0.015)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Payee:</span>
                      <strong style={{ color: '#1A1A2E' }}>Smart Coir Ltd</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>UPI ID:</span>
                      <strong style={{ color: '#1A1A2E' }}>pay@smartcoir</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px', marginTop: '8px' }}>
                      <span>Amount Due:</span>
                      <strong style={{ color: '#2D6A4F', fontSize: '16px' }}>₹{total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #95D5B2 100%)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(45, 106, 79, 0.2)',
                    }}
                  >
                    Simulate App Scan & Pay
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
