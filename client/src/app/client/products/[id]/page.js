'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    e.preventDefault();
    if (!shippingAddress) {
      setErrorMessage(t('provideAddress'));
      return;
    }
    setSubmittingOrder(true);
    setErrorMessage('');
    try {
      const billing = calculateBilling();
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

  if (loading || !productId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justify: 'center', background: '#08080F', color: '#F0EBE0', fontFamily: 'Poppins' }}>
        {t('loadingSpecs')}
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#08080F', color: '#F0EBE0', fontFamily: 'Poppins' }}>
        <p style={{ color: '#ef4444', marginBottom: '20px' }}>{errorMessage}</p>
        <Link href="/client/inventory" className="btn-gold" style={{ textDecoration: 'none' }}>{t('backToInventory')}</Link>
      </div>
    );
  }

  const { subtotal, tax, shipping, total } = calculateBilling();

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <Link href="/client/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#A09888', textDecoration: 'none', fontSize: '14px', marginBottom: '32px' }}>
        ← {t('backToInventory')}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }} className="detail-grid">
        
        {/* Left Column: Product Info & Specifications */}
        <div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '4px 12px', borderRadius: '10px', textTransform: 'uppercase', fontFamily: 'Poppins' }}>
              {product.qualityGrade} {t('grade')}
            </span>
            <span style={{ fontSize: '11px', color: '#8A8070', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SKU: {product.sku}
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0', marginBottom: '16px' }}>
            {product.name}
          </h1>

          <p style={{ color: '#A09888', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px', fontFamily: 'Poppins' }}>
            {product.description}
          </p>

          {/* Specifications Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px 32px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
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
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                  <span style={{ color: '#8A8070' }}>{spec.label}</span>
                  <span style={{ color: '#F0EBE0', fontWeight: 500 }}>{spec.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Inventory Tag */}
          {product.qrCodeUrl && (
            <div style={{
              marginTop: '32px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C', marginBottom: '8px' }}>
                  {t('qrCodeInventoryTag')}
                </h3>
                <p style={{ fontSize: '12px', color: '#8A8070', lineHeight: 1.5, fontFamily: 'Poppins', maxWidth: '280px', margin: 0 }}>
                  {t('qrVerifyDesc')}
                </p>
              </div>
              <div style={{
                background: '#fff',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
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
              <p style={{ fontSize: '13px', color: '#A09888', fontFamily: 'Poppins', lineHeight: 1.6 }}>
                {t('orderSuccessDesc')}
              </p>
            </motion.div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '24px' }}>
                {t('placeOrderRequest')}
              </h3>

              {errorMessage && (
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '13px', marginBottom: '20px', fontFamily: 'Poppins' }}>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px', fontWeight: 500, fontFamily: 'Poppins' }}>
                    <span style={{ color: '#A09888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('quantityTons')} ({t(product.price.perUnit.toLowerCase())})</span>
                    <span style={{ color: '#C9A84C' }}>{t('rate')}: ₹{product.price.amount} / {t(product.price.perUnit.toLowerCase())}</span>
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
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F0EBE0',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Shipping Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#A09888', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F0EBE0',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#A09888', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('preferredPaymentMethod')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#12121E',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F0EBE0',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  >
                    <option value="bank-transfer">{t('bankTransferOption')}</option>
                    <option value="letter-of-credit">{t('lcOption')}</option>
                    <option value="net-30">{t('net30Option')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#A09888', fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F0EBE0',
                      outline: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Billing Summary */}
                <div style={{
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'Poppins',
                  border: '1px solid rgba(255,255,255,0.02)',
                }}>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8A8070' }}>{t('subtotal')}</span>
                    <span style={{ color: '#F0EBE0' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8A8070' }}>{t('estimatedGst')}</span>
                    <span style={{ color: '#F0EBE0' }}>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between' }}>
                    <span style={{ color: '#8A8070' }}>{t('shippingLogistics')}</span>
                    <span style={{ color: '#F0EBE0' }}>{shipping === 0 ? t('free') : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontWeight: 600, fontSize: '15px' }}>
                    <span style={{ color: '#C9A84C' }}>{t('estimatedTotal')}</span>
                    <span style={{ color: '#C9A84C' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)',
                    color: '#08080F',
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    border: 'none',
                    cursor: submittingOrder ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(201, 168, 76, 0.2)',
                  }}
                >
                  {submittingOrder ? t('submittingOrderRequest') : t('placeOrderRequest')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
