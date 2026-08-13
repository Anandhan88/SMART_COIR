'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const CITIES = ['Salem', 'Perundurai', 'Erode', 'Dharmapuri', 'Namakkal', 'Coimbatore', 'Bengaluru', 'Pollachi', 'Chennai', 'Hyderabad'];

export default function InventoryBrowse() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Directory Filter States
  const [selectedCity, setSelectedCity] = useState('all');
  const [citySearch, setCitySearch] = useState('');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'below-35', '36-45', '46-100', 'above-101'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedWeights, setSelectedWeights] = useState([]); // Array of numbers
  const [filterSalemOnly, setFilterSalemOnly] = useState(false);
  const [filterTurnover, setFilterTurnover] = useState(false);
  const [filterGst, setFilterGst] = useState(false);

  // Inquiry Modal States
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data.success) {
        // Enrich products with mock supplier/location/weight data to support the Salem-based search and price/weight sidebar filtering!
        const enriched = res.data.data.map((p, index) => {
          const cities = ['Salem', 'Pollachi', 'Alappuzha', 'Chennai', 'Erode', 'Dharmapuri', 'Namakkal', 'Coimbatore', 'Bengaluru', 'Hyderabad'];
          const weights = [5, 10, 15, 20];
          
          return {
            ...p,
            city: p.supplier?.contact?.address?.city || cities[index % cities.length],
            supplierName: p.supplier?.company || ['Sri Sai Coir & Fibre', 'Sugun Fibres', 'Kalasanskruti Coir Products', 'Parnavi Export', 'Rabitha Exports'][index % 5],
            weightClass: weights[index % weights.length],
            hasGst: index % 2 === 0,
            turnover5Cr: index % 3 === 0,
            rating: (3.2 + (index % 3) * 0.6).toFixed(1),
            reviews: 10 + (index * 13) % 150,
          };
        });
        setProducts(enriched);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on all sidebar & header filter configurations
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    // City filter
    const matchesCity = selectedCity === 'all' || p.city.toLowerCase() === selectedCity.toLowerCase();
    
    // Salem-based supplier filter
    const matchesSalemOnly = !filterSalemOnly || p.city.toLowerCase() === 'salem';
    
    // Price Ranges
    let matchesPrice = true;
    const price = p.price.amount;
    
    if (priceRange === 'below-35') {
      matchesPrice = price < 35;
    } else if (priceRange === '36-45') {
      matchesPrice = price >= 36 && price <= 45;
    } else if (priceRange === '46-100') {
      matchesPrice = price >= 46 && price <= 100;
    } else if (priceRange === 'above-101') {
      matchesPrice = price > 100;
    }
    
    // Custom Min/Max Price values
    if (minPrice && parseFloat(minPrice)) {
      matchesPrice = matchesPrice && price >= parseFloat(minPrice);
    }
    if (maxPrice && parseFloat(maxPrice)) {
      matchesPrice = matchesPrice && price <= parseFloat(maxPrice);
    }
    
    // Weight Class
    const matchesWeight = selectedWeights.length === 0 || selectedWeights.includes(p.weightClass);
    
    // Business Credentials
    const matchesGst = !filterGst || p.hasGst;
    const matchesTurnover = !filterTurnover || p.turnover5Cr;
    
    return matchesSearch && matchesCategory && matchesCity && matchesSalemOnly && matchesPrice && matchesWeight && matchesGst && matchesTurnover;
  });

  const handleWeightCheckboxChange = (weight) => {
    if (selectedWeights.includes(weight)) {
      setSelectedWeights(selectedWeights.filter(w => w !== weight));
    } else {
      setSelectedWeights([...selectedWeights, weight]);
    }
  };

  const handleNearMeClick = () => {
    setSelectedCity('Salem');
    setCitySearch('Salem');
  };

  const handleContactSupplier = (product) => {
    setSelectedProductForInquiry(product);
    setInquiryMessage(`Hello, I am interested in your ${product.name} priced at ₹${product.price.amount}/${product.price.perUnit}. Please send me the technical catalog and wholesale bulk shipping delivery terms for Dharmapuri location.`);
    setInquirySuccess(false);
    setInquiryModalOpen(true);
  };

  const submitSupplierInquiry = async (e) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    try {
      // Simulate API inquiry call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const getProductImage = (p) => {
    if (p.images && p.images.length > 0 && p.images[0].url) {
      return p.images[0].url;
    }
    // If we have custom product image files in public
    if (p.category === 'coir-rope') return '/images/products/coir-rope.jpg';
    if (p.category === 'coir-yarn') return '/images/products/coir-yarn.jpg';
    if (p.category === 'coir-bundle') return '/images/products/coir-bundle.jpg';
    if (p.category === 'raw-coir-fiber') return '/images/products/raw-fiber.jpg';
    return '/images/products/coir-rope.jpg';
  };

  return (
    <div style={{ padding: '40px 64px' }}>
      
      {/* Title & Description */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '8px' }}>
          Coir Products Directory {selectedCity !== 'all' ? `near ${selectedCity}` : ''}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '14px', fontFamily: 'Poppins' }}>
          Find high-grade industrial coir fiber, yarns, curled ropes and bundles from verified regional manufacturers.
        </p>
      </div>

      {/* Top Filter Bar: City Selector & Search */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          {/* City Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Select City or Enter Location to find sellers near you..."
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                if (e.target.value === '') setSelectedCity('all');
              }}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.015)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                color: '#1A1A2E',
                outline: 'none',
                fontFamily: 'Poppins',
                fontSize: '13px',
                transition: 'border 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2D6A4F'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.05)'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSelectedCity(citySearch || 'all');
                }
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>📍</span>
          </div>

          {/* Near Me Button */}
          <button
            onClick={handleNearMeClick}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'rgba(45, 106, 79, 0.08)',
              border: '1.5px solid rgba(45, 106, 79, 0.15)',
              color: '#2D6A4F',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: 'Poppins',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(45, 106, 79, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(45, 106, 79, 0.08)'}
          >
            🧭 Near Me
          </button>

          {/* Keyword Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search product keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.015)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                color: '#1A1A2E',
                outline: 'none',
                fontFamily: 'Poppins',
                fontSize: '13px',
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E9A' }}>🔍</span>
          </div>
        </div>

        {/* Hot Cities Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8E8E9A', marginRight: '8px' }}>
            Popular Hubs:
          </span>
          <button
            onClick={() => { setSelectedCity('all'); setCitySearch(''); }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'Poppins',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: selectedCity === 'all' ? '#2D6A4F' : 'rgba(0,0,0,0.03)',
              color: selectedCity === 'all' ? '#FFFFFF' : '#5C5C6B',
              border: 'none',
            }}
          >
            All Cities
          </button>
          {CITIES.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); setCitySearch(city); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Poppins',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? '#2D6A4F' : 'rgba(0,0,0,0.03)',
                  color: isSelected ? '#FFFFFF' : '#5C5C6B',
                  border: 'none',
                }}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Layout: Sidebar & Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px' }} className="directory-layout">
        
        {/* Left Column: Filter Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Category Selector Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Product Category</span>
              <span>▼</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                      border: 'none',
                      color: isSelected ? '#2D6A4F' : '#5C5C6B',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {t(cat.key)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Filter Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Price Range</span>
              <span>▼</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
              {[
                { label: 'All Prices', val: 'all' },
                { label: 'Below ₹35 / kg', val: 'below-35' },
                { label: '₹36 - ₹45 / kg', val: '36-45' },
                { label: '₹46 - ₹100 / kg', val: '46-100' },
                { label: 'Above ₹101 / kg', val: 'above-101' },
              ].map((pOpt) => (
                <label key={pOpt.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === pOpt.val}
                    onChange={() => setPriceRange(pOpt.val)}
                    style={{ accentColor: '#2D6A4F' }}
                  />
                  {pOpt.label}
                </label>
              ))}

              {/* Custom Min/Max price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '12px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    width: '65px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    width: '65px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                />
                <button
                  style={{
                    padding: '8px 12px',
                    background: '#2D6A4F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Business Credentials Filter Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Business Credentials</span>
              <span>▼</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterTurnover}
                  onChange={() => setFilterTurnover(!filterTurnover)}
                  style={{ accentColor: '#2D6A4F' }}
                />
                Annual turnover ₹5 Cr+
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterGst}
                  onChange={() => setFilterGst(!filterGst)}
                  style={{ accentColor: '#2D6A4F' }}
                />
                GST Registered
              </label>
            </div>
          </div>

          {/* Regional Filters Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Supplier Location</span>
              <span>▼</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterSalemOnly}
                  onChange={() => setFilterSalemOnly(!filterSalemOnly)}
                  style={{ accentColor: '#2D6A4F' }}
                />
                Salem-based Suppliers
              </label>
            </div>
          </div>

          {/* Packaging Weight Filter Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bundle Weight</span>
              <span>▼</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: 'Poppins', color: '#5C5C6B' }}>
              {[5, 10, 15, 20].map((wt) => (
                <label key={wt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedWeights.includes(wt)}
                    onChange={() => handleWeightCheckboxChange(wt)}
                    style={{ accentColor: '#2D6A4F' }}
                  />
                  {wt} kg packages
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Product Directory Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '80px 40px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', color: '#8E8E9A' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📦</span>
              <h3 style={{ fontSize: '16px', color: '#1A1A2E', fontWeight: 600, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>
                No suppliers matching current filters
              </h3>
              <p style={{ fontSize: '13px', fontFamily: 'Poppins', margin: 0 }}>
                Try relaxing your location search or custom price/weight range bounds.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Results count indicator */}
              <div style={{ fontSize: '13px', color: '#8E8E9A', fontFamily: 'Poppins' }}>
                Showing <strong>{filteredProducts.length}</strong> matching coir supplier listings
              </div>

              {/* Grid Wrapper */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '24px',
              }}>
                {filteredProducts.map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'rgba(45, 106, 79, 0.2)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(45, 106, 79, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.02)';
                    }}
                  >
                    {/* Top Slider Mock Gallery */}
                    <div style={{
                      height: '210px',
                      background: '#F5EFEB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderBottom: '1px solid rgba(0,0,0,0.02)',
                    }}>
                      <Link href={`/client/products/${p._id}`} style={{ width: '100%', height: '100%', display: 'block' }}>
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Link>
                      
                      {/* Interactive slide controls overlay */}
                      <div style={{ position: 'absolute', left: '10px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#5C5C6B', cursor: 'pointer' }}>◀</div>
                      <div style={{ position: 'absolute', right: '10px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#5C5C6B', cursor: 'pointer' }}>▶</div>

                      {/* Trust badges */}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        background: p.hasGst ? '#F59E0B' : '#3B82F6',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}>
                        {p.hasGst ? 'Star Supplier' : 'Verified Exporter'}
                      </span>

                      {/* Slides indicator dots */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F' }} />
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                      </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      
                      {/* Name & Location */}
                      <Link href={`/client/products/${p._id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '4px', lineHeight: 1.3 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#2D6A4F'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1A1A2E'}>
                          {p.name}
                        </h3>
                      </Link>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#8E8E9A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {p.city}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ★ {p.rating} <span style={{ fontWeight: 400, color: '#8E8E9A' }}>({p.reviews})</span>
                        </span>
                      </div>

                      {/* Specs List Box */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.015)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontFamily: 'Poppins',
                        marginBottom: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8E8E9A' }}>Weight</span>
                          <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{p.weightClass} kg</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8E8E9A' }}>Diameter</span>
                          <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{p.specifications?.diameter || '8 mm'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8E8E9A' }}>Type / Color</span>
                          <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{p.specifications?.color || 'Natural Brown'}</span>
                        </div>
                      </div>

                      {/* Bottom row: Price & Contact Button */}
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontSize: '9px', color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('price')}</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#2D6A4F', fontFamily: 'Space Grotesk' }}>
                            ₹{p.price.amount} <span style={{ fontSize: '11px', color: '#8E8E9A', fontWeight: 400 }}>/ {t(p.price.perUnit.toLowerCase())}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleContactSupplier(p)}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(15, 118, 110, 0.08)',
                              border: '1.5px solid #0F766E',
                              color: '#0F766E',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '11.5px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontFamily: 'Poppins',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(15, 118, 110, 0.15)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(15, 118, 110, 0.08)';
                            }}
                          >
                            Inquire
                          </button>
                          <Link
                            href={`/client/products/${p._id}`}
                            style={{
                              padding: '8px 14px',
                              background: '#0F766E',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '11.5px',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s',
                              fontFamily: 'Poppins',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#0D9488'}
                            onMouseLeave={e => e.currentTarget.style.background = '#0F766E'}
                          >
                            {t('placeOrder')}
                          </Link>
                        </div>
                      </div>

                      {/* Supplier Badge details */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '10px', color: '#2D6A4F', fontWeight: 500, fontFamily: 'Poppins' }}>
                        <span style={{ padding: '2px 6px', background: 'rgba(45, 106, 79, 0.06)', borderRadius: '4px' }}>✓ GST</span>
                        <span style={{ padding: '2px 6px', background: 'rgba(45, 106, 79, 0.06)', borderRadius: '4px' }}>✓ Email</span>
                        <span style={{ padding: '2px 6px', background: 'rgba(45, 106, 79, 0.06)', borderRadius: '4px' }}>✓ Mobile</span>
                      </div>

                      <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#8E8E9A', fontFamily: 'Poppins' }}>
                        {p.supplierName}
                      </div>

                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Supplier Modal Popup */}
      <AnimatePresence>
        {inquiryModalOpen && selectedProductForInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInquiryModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '36px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
              }}
            >
              {inquirySuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎉</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#2D6A4F', marginBottom: '8px' }}>
                    Inquiry Submitted Successfully!
                  </h3>
                  <p style={{ fontSize: '13px', color: '#5C5C6B', fontFamily: 'Poppins', lineHeight: 1.6 }}>
                    Your wholesale trade request has been dispatched to <strong>{selectedProductForInquiry.supplierName}</strong>. They will contact you shortly via email.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitSupplierInquiry}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', margin: 0 }}>
                      Send Wholesale Inquiry
                    </h3>
                    <button
                      type="button"
                      onClick={() => setInquiryModalOpen(false)}
                      style={{ border: 'none', background: 'rgba(0,0,0,0.04)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#8E8E9A' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ background: '#F8F5F0', padding: '16px', borderRadius: '12px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
                    <img
                      src={getProductImage(selectedProductForInquiry)}
                      alt={selectedProductForInquiry.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A2E' }}>{selectedProductForInquiry.name}</div>
                      <div style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: 600 }}>₹{selectedProductForInquiry.price.amount}/{selectedProductForInquiry.price.perUnit}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8E8E9A', marginBottom: '6px' }}>
                      Message to Supplier
                    </label>
                    <textarea
                      rows="5"
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontSize: '13px',
                        color: '#1A1A2E',
                        fontFamily: 'Poppins',
                        resize: 'none',
                        outline: 'none',
                      }}
                      onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Poppins',
                      border: 'none',
                      cursor: submittingInquiry ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(45, 106, 79, 0.2)',
                    }}
                  >
                    {submittingInquiry ? 'Sending Inquiry...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS adjustments */}
      <style>{`
        @media (max-width: 992px) {
          .directory-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
