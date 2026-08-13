'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage('Reset link/code requested. Check server console for demo code!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F8F5F0' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
      >
        <h2 style={{ marginBottom: '20px', fontFamily: 'Space Grotesk' }}>Forgot Password</h2>
        {message && <p style={{ color: '#2D6A4F', marginBottom: '15px' }}>{message} <Link href="/login/reset" style={{color: '#2D6A4F', fontWeight: 'bold'}}>Proceed to Reset</Link></p>}
        {error && <p style={{ color: '#D00000', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#2D6A4F', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <Link href="/login">Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
