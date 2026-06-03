'use client';
import { motion } from 'framer-motion';

const products = [
  {
    name: 'Premium Coir Rope',
    category: 'Rope',
    grade: 'Export Grade',
    price: '₹320/kg',
    desc: 'High tensile strength coir rope for marine, agricultural, and industrial applications.',
    specs: [
      { key: 'Diameter', val: '6–32mm' },
      { key: 'Strength', val: '850 kg' },
      { key: 'Moisture', val: '<12%' },
    ],
  },
  {
    name: 'Coir Yarn',
    category: 'Yarn',
    grade: 'Premium',
    price: '₹280/kg',
    desc: 'Fine-spun coir yarn for textile, mat weaving, and geo-textile manufacturing.',
    specs: [
      { key: 'Thickness', val: '2–6mm' },
      { key: 'Twist', val: 'S/Z twist' },
      { key: 'Type', val: 'Bristle/White' },
    ],
  },
  {
    name: 'Coir Fiber Bundles',
    category: 'Bundle',
    grade: 'Standard',
    price: '₹180/kg',
    desc: 'Compressed coir fiber bundles for mattresses, insulation, and erosion control.',
    specs: [
      { key: 'Weight', val: '25–50kg' },
      { key: 'Length', val: '15–25cm' },
      { key: 'Color', val: 'Golden Brown' },
    ],
  },
  {
    name: 'Raw Coir Fiber',
    category: 'Raw Material',
    grade: 'Industrial',
    price: '₹95/kg',
    desc: 'Unprocessed coir fiber for composite materials and substrate production.',
    specs: [
      { key: 'Moisture', val: '<15%' },
      { key: 'Purity', val: '98%' },
      { key: 'Type', val: 'Brown/White' },
    ],
  },
];

export default function ProductShowcase() {
  return (
    <section id="products" style={{ padding: '160px 0', background: 'var(--bg-secondary)' }}>
      <div className="section-divider" />

      <div className="container-main" style={{ paddingTop: 80 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div className="label-accent" style={{ marginBottom: 20 }}>Our Products</div>
          <h2 className="section-title" style={{ maxWidth: 520, margin: '0 auto 20px' }}>
            Premium <span className="text-gradient">Coir Products</span>
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Industrial-grade coir products manufactured to international export standards
          </p>
        </motion.div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {products.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="card-glass"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
            >
              {/* Top accent line */}
              <div style={{ height: 2, background: 'linear-gradient(90deg, var(--brown), var(--accent), var(--sand))' }} />

              <div style={{ padding: '36px 32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: 2,
                      textTransform: 'uppercase', padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-dim)',
                      border: '1px solid rgba(201,168,76,0.15)',
                      color: 'var(--accent)', fontFamily: 'Poppins',
                    }}>
                      {product.grade}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 500, letterSpacing: 1.5,
                      textTransform: 'uppercase', padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-3)', fontFamily: 'Poppins',
                    }}>
                      {product.category}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    fontFamily: 'Space Grotesk',
                    color: 'var(--accent)',
                  }}>
                    {product.price}
                  </div>
                </div>

                {/* Name & desc */}
                <h3 style={{
                  fontSize: 22, fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  marginBottom: 12, marginTop: 16,
                }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 28 }}>
                  {product.desc}
                </p>

                {/* Specs */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                  marginBottom: 28,
                }}>
                  {product.specs.map((s, j) => (
                    <div
                      key={j}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4, fontFamily: 'Poppins', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {s.key}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sand)' }}>
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 20,
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ADE80' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
                    In Stock
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13, fontWeight: 600, color: 'var(--accent)',
                    fontFamily: 'Poppins',
                  }}>
                    View Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
