'use client';
import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Coconut Husk Collection', desc: 'Premium coconut husks sourced from certified plantations. Each batch is quality-inspected for fiber density.', icon: '🥥' },
  { num: '02', title: 'Coir Fiber Extraction', desc: 'Advanced retting and mechanical extraction separates high-quality fibers with maximum yield.', icon: '🌿' },
  { num: '03', title: 'Fiber Drying & Processing', desc: 'Industrial drying ensures optimal moisture content below 15% for superior tensile strength.', icon: '☀️' },
  { num: '04', title: 'Bundle Compression', desc: 'Processed fibers are compressed into standardized bundles using hydraulic presses.', icon: '📦' },
  { num: '05', title: 'Rope Manufacturing', desc: 'State-of-the-art spinning machines twist fibers into premium-grade ropes.', icon: '🔧' },
  { num: '06', title: 'Quality Inspection', desc: 'Multi-point quality checks including tensile strength testing and moisture analysis.', icon: '✅' },
  { num: '07', title: 'Export & Delivery', desc: 'Global logistics network covering 25+ countries with real-time tracking.', icon: '🚢' },
];

export default function ManufacturingProcess() {
  return (
    <section id="process" style={{ padding: '160px 0', background: 'var(--bg-primary)' }}>
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 100 }}
        >
          <div className="label-accent" style={{ marginBottom: 20 }}>Manufacturing Process</div>
          <h2 className="section-title" style={{ maxWidth: 580, margin: '0 auto 20px' }}>
            From Husk to <span className="text-gradient">Premium Product</span>
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Our vertically integrated process ensures quality at every stage of production
          </p>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          {/* Center line */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
            background: 'linear-gradient(180deg, transparent, rgba(45,106,79,0.2), rgba(27,67,50,0.15), transparent)',
          }} className="hidden lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 1fr',
                alignItems: 'center',
                marginBottom: i < steps.length - 1 ? 48 : 0,
              }}
              className="process-row"
            >
              {/* Left content (even items) */}
              <div style={{ textAlign: i % 2 === 0 ? 'right' : 'left', order: i % 2 === 0 ? 1 : 3 }}>
                <div className="card-glass" style={{ padding: '36px 32px', display: 'inline-block', textAlign: 'left', maxWidth: 400 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <span style={{ fontSize: 28 }}>{step.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: 'var(--accent)', fontFamily: 'Poppins', textTransform: 'uppercase' }}>
                        Step {step.num}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--text-1)' }}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>

              {/* Center dot */}
              <div style={{ display: 'flex', justifyContent: 'center', order: 2 }} className="hidden lg:flex">
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--brown), var(--accent))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#FFFFFF',
                  fontFamily: 'Space Grotesk',
                  boxShadow: '0 0 24px rgba(45,106,79,0.2)',
                }}>
                  {step.num}
                </div>
              </div>

              {/* Empty spacer */}
              <div style={{ order: i % 2 === 0 ? 3 : 1 }} className="hidden lg:block" />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .process-row { grid-template-columns: 1fr !important; }
          .process-row > div { order: unset !important; text-align: left !important; }
        }
      `}</style>
    </section>
  );
}
