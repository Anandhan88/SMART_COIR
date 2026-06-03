'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

const adminMenuItems = [
  { name: 'Admin Home', key: 'adminHome', href: '/admin/dashboard', icon: '📊' },
  { name: 'Manage Products', key: 'manageProducts', href: '/admin/inventory', icon: '🛠️' },
  { name: 'Client Orders', key: 'clientOrders', href: '/admin/orders', icon: '📥' },
  { name: 'Support Chat', key: 'chat', href: '/admin/chat', icon: '💬' },
  { name: 'QR Scanner', key: 'scanner', href: '/admin/scanner', icon: '📷' },
  { name: 'Worker Directory', key: 'workers', href: '/admin/workers', icon: '👷' },
  { name: 'Supplier Directory', key: 'suppliers', href: '/admin/suppliers', icon: '🚛' },
];

export default function AdminLayout({ children }) {
  const { lang, setLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = () => setLangOpen(false);
    if (langOpen) {
      setTimeout(() => document.addEventListener('click', handleClick), 0);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [langOpen]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'superadmin') {
        router.push('/client/dashboard');
      }
    }
  }, [user, loading, router]);

  // Load notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen to socket notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new-notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('new-notification');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/users/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await api.put(`/users/notifications/${notif._id}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifDropdownOpen(false);
      if (notif.link) {
        router.push(notif.link);
      }
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08080F',
        color: '#F0EBE0',
        fontFamily: 'Poppins',
      }}>
        {t('loading')} {t('adminPanel')}...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#08080F', color: '#F0EBE0', fontFamily: 'Poppins' }}>
      
      {/* Desktop Admin Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
        }}
        className="hidden md:flex"
      >
        {/* Brand */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <img 
            src="/images/coconut_tree_logo.png?v=2" 
            alt="Smart Coir" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
          />
          {sidebarOpen && (
            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
              Smart<span style={{ color: '#C9A84C' }}>Coir</span> {t('adminPanel')}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(201, 168, 76, 0.15)' : '1px solid transparent',
                  color: isActive ? '#C9A84C' : '#A09888',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#F0EBE0';
                    e.target.style.background = 'rgba(255, 255, 255, 0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#A09888';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {sidebarOpen && <span>{t(item.key)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center' }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#8A8070', cursor: 'pointer', fontSize: '18px', outline: 'none' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{
          height: '70px',
          background: 'rgba(8, 8, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 30,
          position: 'sticky',
          top: 0,
        }}>
          {/* Left: Mobile Toggle & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '24px', outline: 'none' }}
            >
              ☰
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
              {t(pathname.split('/').pop()) || t('adminPanel')}
            </h2>
          </div>

          {/* Right: User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            {/* System Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#44ef88' }} className="hidden sm:flex">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#44ef88', boxShadow: '0 0 6px #44ef88' }} />
              {t('systemStatus')}
            </div>

            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Poppins',
                  color: 'var(--text-2)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {lang === 'en' ? '🇬🇧 EN' : lang === 'ta' ? '🇮🇳 தமிழ்' : '🇮🇳 हिन्दी'}
                <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      background: 'rgba(14, 14, 24, 0.98)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                      minWidth: 140,
                      zIndex: 200,
                    }}
                  >
                    {[
                      { code: 'en', label: '🇬🇧  English' },
                      { code: 'ta', label: '🇮🇳  தமிழ் (Tamil)' },
                      { code: 'hi', label: '🇮🇳  हिन्दी (Hindi)' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={(e) => { e.stopPropagation(); setLang(item.code); setLangOpen(false); }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: 13,
                          fontFamily: 'Poppins',
                          fontWeight: lang === item.code ? 600 : 400,
                          color: lang === item.code ? 'var(--accent)' : 'var(--text-1)',
                          background: lang === item.code ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        onMouseEnter={(e) => {
                          if (lang !== item.code) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          if (lang !== item.code) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div 
              style={{ cursor: 'pointer', fontSize: '20px', position: 'relative' }} 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-4px', right: '-4px', 
                  background: '#C9A84C', color: '#08080F', fontSize: '9px',
                  fontWeight: 700, padding: '2px 5px', borderRadius: '50%',
                  minWidth: '15px', textAlign: 'center', lineHeight: 1
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: '50px', right: '120px',
                    width: '320px', background: '#12121E', border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px', padding: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                    zIndex: 50, maxHeight: '400px', overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#C9A84C' }}>{t('notifications')}</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#8A8070', fontSize: '11px', cursor: 'pointer', outline: 'none' }}>
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#8A8070', fontSize: '12px', fontFamily: 'Poppins' }}>
                      {t('noNotifications')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            background: notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(201, 168, 76, 0.04)',
                            borderLeft: notif.read ? '2px solid transparent' : '2px solid #C9A84C',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                          onMouseLeave={(e)=>e.currentTarget.style.background=notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(201, 168, 76, 0.04)'}
                        >
                          <div style={{ fontSize: '12.5px', fontWeight: notif.read ? 500 : 600, color: '#F0EBE0', marginBottom: '4px', fontFamily: 'Poppins' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#A09888', lineHeight: 1.4, fontFamily: 'Poppins' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '9px', color: '#8A8070', marginTop: '6px', textAlign: 'right', fontFamily: 'Poppins' }}>
                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B6914, #C9A84C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#08080F', fontWeight: 700, fontSize: '14px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }} className="hidden sm:inline">
                {user.name} (Admin)
              </span>
              <span style={{ fontSize: '10px', color: '#8A8070' }}>▼</span>
            </div>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '180px',
                    background: '#12121E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 50,
                  }}
                >
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none',
                      display: 'block', padding: '10px 14px', borderRadius: '8px', color: '#ef4444',
                      cursor: 'pointer', fontSize: '13px', fontFamily: 'Poppins'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {t('signOut')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content Scroll Container */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 45 }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{
                position: 'fixed', top: 0, bottom: 0, left: 0, width: '260px',
                background: '#0E0E18', borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', flexDirection: 'column', zIndex: 46,
              }}
            >
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', justify: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="/images/coconut_tree_logo.png?v=2" alt="Smart Coir" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>SmartCoir</span>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#A09888', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {adminMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 16px', borderRadius: '12px',
                        background: isActive ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                        color: isActive ? '#C9A84C' : '#A09888',
                        textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span>{t(item.key)}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
