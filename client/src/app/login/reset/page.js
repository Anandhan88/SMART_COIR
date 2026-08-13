'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', { code, password });
      if (res.data.success) {
        alert('Password reset successful! You can now log in.');
        router.push('/login');
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
        <h2 style={{ marginBottom: '20px', fontFamily: 'Space Grotesk' }}>Reset Password</h2>
        {error && <p style={{ color: '#D00000', marginBottom: '15px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Reset Code"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#2D6A4F', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Reseting...' : 'Reset Password'}
            </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <Link href="/login">Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
