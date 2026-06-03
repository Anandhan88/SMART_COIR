'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

// Simulated product database for demo when backend is unavailable
const DEMO_PRODUCTS = {
  'COIR-ROPE-001': { name: 'Premium Coir Rope (10mm)', sku: 'COIR-ROPE-001', category: 'Rope', grade: 'Premium', weight: '5kg', stock: 120 },
  'COIR-ROPE-002': { name: 'Industrial Coir Rope (20mm)', sku: 'COIR-ROPE-002', category: 'Rope', grade: 'Industrial', weight: '10kg', stock: 85 },
  'COIR-YARN-001': { name: 'Fine Coir Yarn (2-ply)', sku: 'COIR-YARN-001', category: 'Yarn', grade: 'Export', weight: '2kg', stock: 200 },
  'COIR-YARN-002': { name: 'Heavy Coir Yarn (4-ply)', sku: 'COIR-YARN-002', category: 'Yarn', grade: 'Standard', weight: '5kg', stock: 150 },
  'COIR-BNDL-001': { name: 'Raw Coir Fiber Bundle', sku: 'COIR-BNDL-001', category: 'Bundle', grade: 'Economy', weight: '25kg', stock: 45 },
  'COIR-MAT-001':  { name: 'Coir Door Mat (60x90cm)', sku: 'COIR-MAT-001', category: 'Mat', grade: 'Premium', weight: '3kg', stock: 300 },
  'COIR-PITH-001': { name: 'Coir Pith Block (5kg)', sku: 'COIR-PITH-001', category: 'Pith', grade: 'Standard', weight: '5kg', stock: 500 },
};

export default function AdminScannerPage() {
  const { t } = useLanguage();
  const [scanResult, setScanResult] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [adjustmentSuccess, setAdjustmentSuccess] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [simulatedScanning, setSimulatedScanning] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle file upload and QR decode
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanError('');
    setScanResult(null);
    setProductInfo(null);
    setAdjustmentSuccess('');
    setIsScanning(true);

    try {
      // Load image
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async (evt) => {
        img.onload = async () => {
          // Draw to canvas for pixel data extraction
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            // Dynamic import jsqr
            const jsQR = (await import('jsqr')).default;
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
              handleScanSuccess(code.data);
            } else {
              setScanError('No QR code detected in the image. Please upload a valid QR code image.');
              setIsScanning(false);
            }
          } catch (err) {
            console.error('jsQR import error:', err);
            setScanError('QR decoder module failed to load. Please try again.');
            setIsScanning(false);
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanError('Failed to process image file.');
      setIsScanning(false);
    }
  }, []);

  // Handle successful scan
  const handleScanSuccess = async (data) => {
    setScanResult(data);
    setIsScanning(false);

    // Add to scan history
    setScanHistory(prev => [
      { data, timestamp: new Date(), status: 'decoded' },
      ...prev.slice(0, 9) // Keep last 10
    ]);

    // Try to look up product from backend
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(data)}`);
      if (res.data.success && res.data.data?.length > 0) {
        setProductInfo(res.data.data[0]);
        return;
      }
    } catch (err) {
      console.log('Backend lookup failed, checking demo database');
    }

    // Fallback to demo product lookup
    const demoProduct = DEMO_PRODUCTS[data] || DEMO_PRODUCTS[data.toUpperCase()];
    if (demoProduct) {
      setProductInfo({ ...demoProduct, _id: 'demo-' + demoProduct.sku, isDemo: true });
    } else {
      // Try to parse as JSON (some QR codes embed JSON data)
      try {
        const parsed = JSON.parse(data);
        if (parsed.sku || parsed.name || parsed.productId) {
          setProductInfo({
            _id: parsed.productId || parsed._id || 'parsed-item',
            name: parsed.name || 'Scanned Product',
            sku: parsed.sku || data.substring(0, 20),
            category: parsed.category || 'Unknown',
            grade: parsed.grade || parsed.qualityGrade || 'N/A',
            weight: parsed.weight || 'N/A',
            stock: parsed.stock || parsed.quantity || 0,
            isDemo: true,
          });
        }
      } catch {
        // Not JSON — treat as raw text
        setProductInfo(null);
      }
    }
  };

  // Simulated scan (demo mode)
  const handleSimulatedScan = () => {
    setSimulatedScanning(true);
    setScanError('');
    setScanResult(null);
    setProductInfo(null);
    setAdjustmentSuccess('');

    // Simulate scanning delay
    const skus = Object.keys(DEMO_PRODUCTS);
    const randomSku = skus[Math.floor(Math.random() * skus.length)];

    setTimeout(() => {
      handleScanSuccess(randomSku);
      setSimulatedScanning(false);
    }, 1500);
  };

  // Handle camera toggle
  const handleCameraToggle = async () => {
    if (cameraActive) {
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Start scanning loop
      const scanFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            const jsQR = (await import('jsqr')).default;
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              handleScanSuccess(code.data);
              // Stop camera after successful scan
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
              }
              setCameraActive(false);
              return;
            }
          } catch {}
        }
        animationRef.current = requestAnimationFrame(scanFrame);
      };
      scanFrame();
    } catch (err) {
      setScanError('Camera access denied or not available. Use file upload or simulated scan instead.');
    }
  };

  // Handle stock adjustment submission
  const handleStockAdjustment = async () => {
    if (!productInfo || adjustmentQty <= 0) return;

    try {
      await api.put(`/inventory/${productInfo._id}/adjust`, {
        quantity: adjustmentType === 'add' ? adjustmentQty : -adjustmentQty,
        reason: adjustmentNote || `QR scan adjustment (${adjustmentType})`,
      });
      setAdjustmentSuccess(`Stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} by ${adjustmentQty} units successfully!`);
      setAdjustmentQty(0);
      setAdjustmentNote('');
    } catch (err) {
      // Simulated success for demo
      if (productInfo.isDemo) {
        setAdjustmentSuccess(`[Demo] Stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} by ${adjustmentQty} units!`);
        setAdjustmentQty(0);
        setAdjustmentNote('');
      } else {
        setScanError('Failed to adjust stock. Please try again.');
      }
    }
  };

  // Styles
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    padding: '28px',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#8A8070',
    marginBottom: '8px',
    display: 'block',
    fontFamily: 'Poppins',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#F0EBE0',
    fontSize: '14px',
    fontFamily: 'Poppins',
    outline: 'none',
    transition: 'border 0.3s',
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'Space Grotesk',
          color: '#F0EBE0',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '32px' }}>📷</span>
          {t('qrScanner')}
        </h1>
        <p style={{ color: '#A09888', fontSize: '14px', fontFamily: 'Poppins' }}>
          {t('scannerDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="scanner-grid">
        
        {/* Left: Scanner Area */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C', marginBottom: '20px' }}>
            {t('scanInputTitle')}
          </h3>

          {/* Scanner Viewport */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/3',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '16px',
            border: '2px dashed rgba(201, 168, 76, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            {/* Camera Feed */}
            {cameraActive && (
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
                muted
              />
            )}

            {/* Scanning animation overlay */}
            {(isScanning || simulatedScanning || cameraActive) && (
              <motion.div
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
                  boxShadow: '0 0 20px rgba(201, 168, 76, 0.5)',
                  zIndex: 2,
                }}
              />
            )}

            {/* Corner markers */}
            {[
              { top: '8%', left: '8%', borderTop: '3px solid #C9A84C', borderLeft: '3px solid #C9A84C' },
              { top: '8%', right: '8%', borderTop: '3px solid #C9A84C', borderRight: '3px solid #C9A84C' },
              { bottom: '8%', left: '8%', borderBottom: '3px solid #C9A84C', borderLeft: '3px solid #C9A84C' },
              { bottom: '8%', right: '8%', borderBottom: '3px solid #C9A84C', borderRight: '3px solid #C9A84C' },
            ].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: '24px',
                height: '24px',
                ...pos,
                borderRadius: '2px',
              }} />
            ))}

            {/* Default prompt */}
            {!cameraActive && !isScanning && !simulatedScanning && (
              <div style={{ textAlign: 'center', color: '#8A8070', zIndex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📱</div>
                <p style={{ fontSize: '13px', fontFamily: 'Poppins' }}>
                  {t('scanPromptDesc')}
                </p>
              </div>
            )}

            {simulatedScanning && (
              <div style={{ textAlign: 'center', color: '#C9A84C', zIndex: 3 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: '36px', marginBottom: '8px' }}
                >
                  ⟳
                </motion.div>
                <p style={{ fontSize: '13px', fontFamily: 'Poppins' }}>{t('scanningProductTag')}</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 100%)',
                color: '#08080F',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {t('uploadQrImageBtn')}
            </button>

            <button
              onClick={handleCameraToggle}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                background: cameraActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(201, 168, 76, 0.08)',
                color: cameraActive ? '#ef4444' : '#C9A84C',
                fontWeight: 600,
                fontSize: '13px',
                border: `1px solid ${cameraActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(201, 168, 76, 0.2)'}`,
                cursor: 'pointer',
                fontFamily: 'Poppins',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {cameraActive ? t('stopCameraBtn') : t('liveCameraBtn')}
            </button>

            <button
              onClick={handleSimulatedScan}
              disabled={simulatedScanning}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'rgba(46, 204, 113, 0.08)',
                color: '#2ecc71',
                fontWeight: 600,
                fontSize: '13px',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                cursor: simulatedScanning ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: simulatedScanning ? 0.5 : 1,
              }}
            >
              {t('demoScanBtn')}
            </button>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {scanError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                }}
              >
                ⚠️ {scanError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <span style={labelStyle}>{t('recentScansTitle')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {scanHistory.map((scan, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '12px',
                    fontFamily: 'Poppins',
                  }}>
                    <span style={{ color: '#F0EBE0', fontWeight: 500 }}>
                      {scan.data.length > 30 ? scan.data.substring(0, 30) + '...' : scan.data}
                    </span>
                    <span style={{ color: '#8A8070', fontSize: '10px' }}>
                      {scan.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Info & Stock Adjustment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Scan Result */}
          <AnimatePresence mode="wait">
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={cardStyle}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C', marginBottom: '16px' }}>
                  ✅ {t('scanResultTitle')}
                </h3>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(46, 204, 113, 0.05)',
                  border: '1px solid rgba(46, 204, 113, 0.15)',
                  color: '#2ecc71',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}>
                  {scanResult}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Details */}
          <AnimatePresence mode="wait">
            {productInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={cardStyle}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C' }}>
                    {t('productDetails')}
                  </h3>
                  {productInfo.isDemo && (
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(201, 168, 76, 0.1)',
                      border: '1px solid rgba(201, 168, 76, 0.2)',
                      color: '#C9A84C',
                      fontSize: '10px',
                      fontWeight: 600,
                      fontFamily: 'Poppins',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {t('demoDataBadge')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: t('prodName'), value: productInfo.name },
                    { label: t('skuLabel').split(' ')[0], value: productInfo.sku || productInfo._id },
                    { label: t('categories'), value: productInfo.category },
                    { label: t('qualityGradeLabel'), value: productInfo.grade || productInfo.qualityGrade || 'N/A' },
                    { label: t('weightLabel'), value: productInfo.weight || 'N/A' },
                    { label: t('currentStockLabel'), value: productInfo.stock || productInfo.quantity || '—', highlight: true },
                  ].map((field, i) => (
                    <div key={i}>
                      <span style={labelStyle}>{field.label}</span>
                      <div style={{
                        fontSize: field.highlight ? '20px' : '14px',
                        fontWeight: field.highlight ? 700 : 500,
                        color: field.highlight ? '#C9A84C' : '#F0EBE0',
                        fontFamily: field.highlight ? 'Space Grotesk' : 'Poppins',
                      }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Adjustment */}
          <AnimatePresence mode="wait">
            {productInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  ...cardStyle,
                  borderColor: 'rgba(201, 168, 76, 0.15)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C', marginBottom: '20px' }}>
                  {t('stockAdjustmentTitle')}
                </h3>

                {/* Type Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {['add', 'remove'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAdjustmentType(type)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        fontFamily: 'Poppins',
                        transition: 'all 0.3s',
                        background: adjustmentType === type
                          ? (type === 'add' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                          : 'rgba(255,255,255,0.02)',
                        color: adjustmentType === type
                          ? (type === 'add' ? '#2ecc71' : '#ef4444')
                          : '#8A8070',
                        border: `1px solid ${adjustmentType === type
                          ? (type === 'add' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                          : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {type === 'add' ? t('addStockBtn') : t('removeStockBtn')}
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={labelStyle}>{t('quantityLabel').replace(':', '')}</span>
                  <input
                    type="number"
                    min="0"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                    style={inputStyle}
                    placeholder="Enter quantity..."
                    onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Note */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={labelStyle}>{t('adjustmentNoteLabel')}</span>
                  <input
                    type="text"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    style={inputStyle}
                    placeholder={t('adjustmentNotePlaceholder')}
                    onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjustmentQty <= 0}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: adjustmentQty > 0
                      ? 'linear-gradient(135deg, #8B6914 0%, #C9A84C 100%)'
                      : 'rgba(255,255,255,0.03)',
                    color: adjustmentQty > 0 ? '#08080F' : '#8A8070',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: adjustmentQty > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: 'Poppins',
                    transition: 'all 0.3s',
                  }}
                >
                  {adjustmentType === 'add' ? t('addStockSubmit') : t('removeStockSubmit')} {adjustmentQty || 0} {t('units')}
                </button>

                {/* Success Message */}
                <AnimatePresence>
                  {adjustmentSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(46, 204, 113, 0.08)',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        color: '#2ecc71',
                        fontSize: '13px',
                        fontFamily: 'Poppins',
                        textAlign: 'center',
                      }}
                    >
                      ✅ {adjustmentSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!scanResult && (
            <div style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F0EBE0', fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
                {t('noProductScanned')}
              </h3>
              <p style={{ fontSize: '13px', color: '#8A8070', fontFamily: 'Poppins', maxWidth: '280px', lineHeight: 1.6 }}>
                {t('noProductScannedDesc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .scanner-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
