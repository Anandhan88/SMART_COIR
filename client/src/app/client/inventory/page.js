'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

const categories = [
  { id: 'all', name: 'All Categories', key: 'allCategories' },
  { id: 'coir-rope', name: 'Coir Ropes', key: 'coirRopes' },
  { id: 'coir-yarn', name: 'Coir Yarn', key: 'coirYarn' },
  { id: 'coir-bundle', name: 'Fiber Bundles', key: 'fiberBundles' },
  { id: 'raw-coir-fiber', name: 'Raw Fiber', key: 'rawFiber' },
];

export default function InventoryBrowse() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products on frontend
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'coir-rope': return '🧶';
      case 'coir-yarn': return '🧵';
      case 'coir-bundle': return '📦';
      case 'raw-coir-fiber': return '🌾';
      default: return '📦';
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Title & Description */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0', marginBottom: '8px' }}>
          {t('browseProductInventory')}
        </h1>
        <p style={{ color: '#A09888', fontSize: '15px', fontFamily: 'Poppins' }}>
          {t('browseInventoryDesc')}
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '36px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F0EBE0',
              outline: 'none',
              fontFamily: 'Poppins',
              fontSize: '14px',
              transition: 'border 0.3s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8A8070' }}>🔍</span>
        </div>

        {/* Categories Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.01)',
                  border: isSelected ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.06)',
                  color: isSelected ? '#C9A84C' : '#8A8070',
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.target.style.borderColor = '#C9A84C';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                {t(cat.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ color: '#8A8070', fontSize: '15px', textAlign: 'center', padding: '100px' }}>
          {t('loadingCatalog')}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ color: '#8A8070', fontSize: '15px', textAlign: 'center', padding: '100px' }}>
          {t('noProductsMatch')}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {filteredProducts.map((p, index) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s',
              }}
              className="product-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.25)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(201, 168, 76, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
            >
              {/* Product Type Header Indicator */}
              <div style={{ height: '140px', background: 'linear-gradient(135deg, #121222 0%, #0E0E18 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
                <span style={{ fontSize: '48px' }}>{getCategoryEmoji(p.category)}</span>
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#C9A84C',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                }}>
                  {p.qualityGrade}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0', marginBottom: '8px' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#A09888', lineHeight: 1.6, marginBottom: '24px', flex: 1, fontFamily: 'Poppins' }}>
                  {p.shortDescription || p.description.substring(0, 100) + '...'}
                </p>

                {/* Footer specs */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#8A8070', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('price')}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#C9A84C', fontFamily: 'Space Grotesk' }}>
                      ₹{p.price.amount} <span style={{ fontSize: '11px', color: '#8A8070', fontWeight: 400 }}>/ {t(p.price.perUnit.toLowerCase())}</span>
                    </div>
                  </div>
                  <Link href={`/client/products/${p._id}`} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '11px', textDecoration: 'none' }}>
                    {t('viewDetails')} →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
