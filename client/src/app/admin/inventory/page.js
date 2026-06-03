'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminInventory() {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  
  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'coir-rope',
    shortDescription: '',
    description: '',
    qualityGrade: 'Standard',
    weight: { value: 50, unit: 'kg' },
    price: { amount: 120, currency: 'INR', perUnit: 'kg' },
    specifications: {
      length: '220m',
      diameter: '10mm',
      tensileStrength: '250 kgf',
      moistureContent: '14%',
      color: 'Golden Brown',
      fiberType: 'Bristle Fiber',
    },
    sku: '',
    initialStock: 100,
    warehouse: 'Main Warehouse A',
    minStock: 20,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await api.get('/inventory/summary');
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      
      // Fetch inventory items
      const inventoryRes = await api.get('/inventory?limit=50');
      if (inventoryRes.data.success) {
        setInventory(inventoryRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Create the Product
      const productPayload = {
        name: newProduct.name,
        category: newProduct.category,
        shortDescription: newProduct.shortDescription || newProduct.description.substring(0, 100),
        description: newProduct.description,
        qualityGrade: newProduct.qualityGrade,
        weight: { value: Number(newProduct.weight.value), unit: newProduct.weight.unit },
        price: { amount: Number(newProduct.price.amount), currency: newProduct.price.currency, perUnit: newProduct.price.perUnit },
        specifications: newProduct.specifications,
        sku: newProduct.sku || `SKU-${Date.now().toString().slice(-6)}`,
        images: [{ url: `/images/products/${newProduct.category}.jpg`, alt: newProduct.name }]
      };

      const productRes = await api.post('/products', productPayload);
      if (!productRes.data.success) {
        throw new Error('Failed to create product record.');
      }
      
      const createdProduct = productRes.data.data;

      // 2. Create the Inventory entry for the product
      const inventoryPayload = {
        product: createdProduct._id,
        quantity: Number(newProduct.initialStock),
        warehouse: newProduct.warehouse,
        minStock: Number(newProduct.minStock)
      };

      const inventoryRes = await api.post('/inventory', inventoryPayload);
      if (inventoryRes.data.success) {
        setSuccessMsg(`Successfully created product "${createdProduct.name}" and entered ${newProduct.initialStock} units in stock!`);
        setShowAddForm(false);
        // Reset form
        setNewProduct({
          name: '',
          category: 'coir-rope',
          shortDescription: '',
          description: '',
          qualityGrade: 'Standard',
          weight: { value: 50, unit: 'kg' },
          price: { amount: 120, currency: 'INR', perUnit: 'kg' },
          specifications: {
            length: '220m',
            diameter: '10mm',
            tensileStrength: '250 kgf',
            moistureContent: '14%',
            color: 'Golden Brown',
            fiberType: 'Bristle Fiber',
          },
          sku: '',
          initialStock: 100,
          warehouse: 'Main Warehouse A',
          minStock: 20,
        });
        
        // Refresh data
        await fetchInventoryData();
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    try {
      const res = await api.put(`/inventory/${adjustingItem._id}`, {
        quantity: Number(adjustQty),
        notes: 'Manual inventory correction'
      });
      if (res.data.success) {
        setAdjustingItem(null);
        await fetchInventoryData();
      }
    } catch (err) {
      console.error('Error updating stock level:', err);
      alert('Failed to update stock.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? (This will remove it from client browsing)')) {
      return;
    }
    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setSuccessMsg('Product successfully deleted.');
        await fetchInventoryData();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0', marginBottom: '8px' }}>
            {t('prodInventoryReserves')}
          </h1>
          <p style={{ color: '#A09888', fontSize: '15px', fontFamily: 'Poppins' }}>
            {t('manageCatalogStockDesc')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '12px 24px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)',
            color: '#08080F', fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(201, 168, 76, 0.2)'
          }}
        >
          {t('addProductBtn')}
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '12px', color: '#2ecc71', fontSize: '13px', marginBottom: '24px', fontFamily: 'Poppins' }}>
          {successMsg}
        </div>
      )}

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: t('totalCatalogProducts'), val: summary.totalItems, icon: '📦' },
          { label: t('totalInStock'), val: summary.totalQuantity, icon: '📈' },
          { label: t('lowStockWarnings'), val: summary.lowStock, icon: '⚠️', color: summary.lowStock > 0 ? '#ef4444' : '#F0EBE0' },
          { label: t('outOfStockItems'), val: summary.outOfStock, icon: '🚨', color: summary.outOfStock > 0 ? '#ef4444' : '#F0EBE0' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8A8070', fontFamily: 'Poppins', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk', color: s.color || '#F0EBE0' }}>{s.val}</div>
            </div>
            <div style={{ fontSize: '28px' }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Stock Levels Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '28px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '24px' }}>
          {t('warehouseStockLevels')}
        </h3>

        {loading ? (
          <div style={{ color: '#8A8070', fontSize: '14px', textAlign: 'center', padding: '60px' }}>
            {t('loadingStockDetails')}
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ color: '#8A8070', fontSize: '14px', textAlign: 'center', padding: '60px' }}>
            {t('noInventoryFound')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8A8070' }}>
                  <th style={{ padding: '12px 8px' }}>{t('productLabel').replace(':', '')}</th>
                  <th style={{ padding: '12px 8px' }}>{t('skuLabel').split(' ')[0]}</th>
                  <th style={{ padding: '12px 8px' }}>{t('warehouseTableHead')}</th>
                  <th style={{ padding: '12px 8px' }}>{t('stockQuantityTableHead')}</th>
                  <th style={{ padding: '12px 8px' }}>{t('status')}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const p = item.product || {};
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F0EBE0' }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: 600 }}>{p.name || 'Unknown Product'}</div>
                        <div style={{ fontSize: '12px', color: '#8A8070', textTransform: 'capitalize' }}>
                          {p.category?.replace('-', ' ')} • {p.qualityGrade} Grade
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#A09888', fontFamily: 'Space Grotesk' }}>
                        {p.sku || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 8px', color: '#A09888' }}>
                        {item.warehouse}
                      </td>
                      <td style={{ padding: '16px 8px', fontWeight: 600 }}>
                        {item.quantity} kg
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                          background: isLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                          color: isLow ? '#ef4444' : '#2ecc71',
                          border: `1px solid ${isLow ? '#ef4444' : '#2ecc71'}20`
                        }}>
                          {item.quantity <= 0 ? t('outOfStock') : isLow ? t('lowStockStatus') : t('inStockStatus')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustQty(item.quantity);
                            }}
                            style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '13px' }}
                          >
                            ✏️ {t('stock')}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                          >
                            {t('deleteBtn')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {adjustingItem && (
          <>
            <div onClick={() => setAdjustingItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '100%', maxWidth: '380px', background: '#12121E', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '28px', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '16px', color: '#C9A84C' }}>
                {t('adjustStockLevel')}
              </h3>
              <p style={{ fontSize: '13px', color: '#A09888', marginBottom: '20px', fontFamily: 'Poppins' }}>
                {t('productLabel')} <strong>{adjustingItem.product?.name}</strong>
              </p>
              <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('qtyInStockKg')}</label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    required
                    style={{
                      padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px', fontFamily: 'Poppins'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setAdjustingItem(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#A09888', cursor: 'pointer', fontFamily: 'Poppins', fontSize: '13px' }}>{t('cancelBtn')}</button>
                  <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)', color: '#08080F', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: '13px' }}>{t('saveChangesBtn')}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Product Dialog Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <div onClick={() => setShowAddForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90 }} />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              style={{
                position: 'fixed', top: '10%', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '90%', maxWidth: '600px', background: '#0E0E18', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px', padding: '36px', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#C9A84C', marginBottom: '6px' }}>
                  {t('createNewProductStockEntry')}
                </h3>
                <p style={{ fontSize: '13px', color: '#8A8070', fontFamily: 'Poppins' }}>
                  {t('registerProductDesc')}
                </p>
              </div>

              {errorMsg && (
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '13px', fontFamily: 'Poppins' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('prodName')}</label>
                    <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} placeholder="E.g. Extra Soft Coir Pith" required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('categories')}</label>
                    <select name="category" value={newProduct.category} onChange={handleInputChange} style={{ padding: '10px 14px', borderRadius: '10px', background: '#12121E', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }}>
                      <option value="coir-rope">Coir Rope</option>
                      <option value="coir-yarn">Coir Yarn</option>
                      <option value="coir-bundle">Fiber Bundle</option>
                      <option value="raw-coir-fiber">Raw Coir Fiber</option>
                      <option value="coir-pith">Coir Pith / Soil</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('skuLabel')}</label>
                    <input type="text" name="sku" value={newProduct.sku} onChange={handleInputChange} placeholder="E.g. CP-SOFT-PITH" required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px', fontFamily: 'Space Grotesk' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('qualityGradeLabel')}</label>
                    <select name="qualityGrade" value={newProduct.qualityGrade} onChange={handleInputChange} style={{ padding: '10px 14px', borderRadius: '10px', background: '#12121E', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }}>
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                      <option value="Export Grade">Export Grade</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Economy">Economy</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('description')}</label>
                  <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Full product features and industrial details..." rows="3" required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px', resize: 'none' }} />
                </div>

                {/* Price and Weight */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('priceInrPerKg')}</label>
                    <input type="number" name="price.amount" value={newProduct.price.amount} onChange={handleInputChange} required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('unitPackagingWeightKg')}</label>
                    <input type="number" name="weight.value" value={newProduct.weight.value} onChange={handleInputChange} required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }} />
                  </div>
                </div>

                {/* Specifications subfields */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', marginBottom: '12px', fontFamily: 'Space Grotesk' }}>{t('technicalSpecifications')}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: '#8A8070' }}>{t('tensileStrength')}</label>
                      <input type="text" name="tensileStrength" value={newProduct.specifications.tensileStrength} onChange={handleSpecChange} placeholder="e.g. 250 kgf" style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#F0EBE0', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: '#8A8070' }}>{t('moistureLevel')}</label>
                      <input type="text" name="moistureContent" value={newProduct.specifications.moistureContent} onChange={handleSpecChange} placeholder="e.g. 14%" style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#F0EBE0', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: '#8A8070' }}>{t('thicknessDiameter')}</label>
                      <input type="text" name="diameter" value={newProduct.specifications.diameter} onChange={handleSpecChange} placeholder="e.g. 10mm" style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#F0EBE0', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: '#8A8070' }}>{t('fiberComposition')}</label>
                      <input type="text" name="fiberType" value={newProduct.specifications.fiberType} onChange={handleSpecChange} placeholder="e.g. Long Bristle" style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#F0EBE0', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>

                {/* Stock Initial */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('initialStockQtyKg')}</label>
                    <input type="number" name="initialStock" value={newProduct.initialStock} onChange={handleInputChange} required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#8A8070', fontFamily: 'Poppins' }}>{t('minStockAlertLimitKg')}</label>
                    <input type="number" name="minStock" value={newProduct.minStock} onChange={handleInputChange} required style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0EBE0', outline: 'none', fontSize: '14px' }} />
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#A09888', cursor: 'pointer', fontSize: '14px' }}>{t('cancelBtn')}</button>
                  <button type="submit" disabled={formSubmitting} style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #D4B896 100%)', color: '#08080F', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(201,168,76,0.2)' }}>
                    {formSubmitting ? t('registeringProduct') : t('createSeedProductBtn')}
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
