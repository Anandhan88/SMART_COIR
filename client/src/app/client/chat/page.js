'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import useSocket from '../../../hooks/useSocket';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClientSupportChat() {
  const { user } = useAuth();
  const socket = useSocket();
  const { t } = useLanguage();

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, adminTyping]);

  // Load available support staff (Admins)
  useEffect(() => {
    async function fetchAdmins() {
      try {
        setLoadingAdmins(true);
        const res = await api.get('/users/admins');
        if (res.data.success) {
          setAdmins(res.data.data);
          
          // Auto-select first admin if available
          if (res.data.data.length > 0) {
            handleSelectAdmin(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching support staff:', err);
      } finally {
        setLoadingAdmins(false);
      }
    }
    fetchAdmins();
  }, []);

  // Handle Socket listeners for incoming messages and typing events
  useEffect(() => {
    if (!socket || !activeChat) return;

    // Join room for this chat
    socket.emit('join-chat', activeChat._id);

    // Message handler
    const handleNewMessage = (msg) => {
      if (msg.chatId === activeChat._id || msg.chat === activeChat._id) {
        // Normalize object structure if needed
        setMessages((prev) => [...prev, msg]);
        setAdminTyping(false);
      }
    };

    // Typing handlers
    const handleUserTyping = (data) => {
      if (data.chatId === activeChat._id && data.userId !== user._id) {
        setAdminTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.chatId === activeChat._id && data.userId !== user._id) {
        setAdminTyping(false);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [socket, activeChat, user]);

  const handleSelectAdmin = async (admin) => {
    setSelectedAdmin(admin);
    try {
      setLoadingMessages(true);
      // Get or create chat
      const chatRes = await api.post('/chat', { participantId: admin._id });
      if (chatRes.data.success) {
        const chat = chatRes.data.data;
        setActiveChat(chat);

        // Fetch messages
        const msgRes = await api.get(`/chat/${chat._id}/messages`);
        if (msgRes.data.success) {
          setMessages(msgRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading chat:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Emit stop typing
    if (socket) {
      socket.emit('stop-typing', { chatId: activeChat._id, userId: user._id });
      setIsTyping(false);
    }

    try {
      const res = await api.post(`/chat/${activeChat._id}/messages`, { content: messageText });
      if (res.data.success) {
        const msg = res.data.data;
        setMessages((prev) => [...prev, msg]);

        // Broadcast to socket
        if (socket) {
          socket.emit('send-message', {
            ...msg,
            chatId: activeChat._id,
          });
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chatId: activeChat._id, userId: user._id });
    }

    // Reset stop-typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { chatId: activeChat._id, userId: user._id });
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '40px 64px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#1A1A2E', marginBottom: '6px' }}>
          {t('liveSupportDesk')}
        </h1>
        <p style={{ color: '#5C5C6B', fontSize: '14px', fontFamily: 'Poppins' }}>
          {t('liveSupportDesc')}
        </p>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        background: 'rgba(0, 0, 0, 0.01)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 0, 0, 0.03)',
        borderRadius: '24px',
        overflow: 'hidden',
      }} className="chat-grid-responsive">

        {/* Left Side: Support Agents List */}
        <div style={{
          borderRight: '1px solid rgba(0, 0, 0, 0.03)',
          background: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.02)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#2D6A4F' }}>
              {t('supportOperators')}
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {loadingAdmins ? (
              <div style={{ color: '#8E8E9A', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                {t('loadingSupportDesk')}
              </div>
            ) : admins.length === 0 ? (
              <div style={{ color: '#8E8E9A', fontSize: '13px', textAlign: 'center', marginTop: '24px', padding: '0 12px' }}>
                {t('noOperatorsOnline')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {admins.map((admin) => {
                  const isSelected = selectedAdmin?._id === admin._id;
                  return (
                    <button
                      key={admin._id}
                      onClick={() => handleSelectAdmin(admin)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        background: isSelected ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                        borderLeft: isSelected ? '3px solid #2D6A4F' : '3px solid transparent',
                        color: isSelected ? '#2D6A4F' : '#1A1A2E',
                        width: '100%',
                      }}
                    >
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                        display: 'flex', alignItems: 'center', justify: 'center',
                        color: '#FFFFFF', fontWeight: 700, fontSize: '13px'
                      }}>
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {admin.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8E8E9A' }}>
                          {admin.company || 'Smart Coir Agent'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.4)' }}>
          {selectedAdmin ? (
            <>
              {/* Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                  display: 'flex', alignItems: 'center', justify: 'center',
                  color: '#FFFFFF', fontWeight: 700, fontSize: '13px'
                }}>
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>{selectedAdmin.name}</h4>
                  <div style={{ fontSize: '11px', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71' }} />
                    {t('operationsAgent')}
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loadingMessages ? (
                  <div style={{ color: '#8E8E9A', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>
                    {t('loadingMessages')}
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ color: '#8E8E9A', fontSize: '13px', textAlign: 'center', margin: 'auto', maxWidth: '320px', fontFamily: 'Poppins', lineHeight: 1.6 }}>
                    {t('welcomeChatWith')} <strong>{selectedAdmin.name}</strong>.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          width: '100%',
                        }}
                      >
                        <div style={{
                          maxWidth: '65%',
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          background: isMe ? 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' : 'rgba(0, 0, 0, 0.02)',
                          border: isMe ? 'none' : '1px solid rgba(0, 0, 0, 0.03)',
                          color: isMe ? '#FFFFFF' : '#1A1A2E',
                          fontSize: '13.5px',
                          lineHeight: 1.5,
                          fontFamily: 'Poppins',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                          <div>{msg.content}</div>
                          <div style={{
                            fontSize: '9px',
                            color: isMe ? 'rgba(255, 255, 255, 0.6)' : '#8E8E9A',
                            textAlign: 'right',
                            marginTop: '6px'
                          }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Admin Typing Indicator */}
                {adminTyping && (
                  <div style={{ display: 'flex', justify: 'flex-start' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(0, 0, 0, 0.01)', border: '1px solid rgba(0, 0, 0, 0.02)', color: '#8E8E9A', fontSize: '12px' }}>
                      {selectedAdmin.name} {t('isTypingText')}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.03)', background: 'rgba(0,0,0,0.15)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={t('typeMessage')}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.015)',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    color: '#1A1A2E',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    fontFamily: 'Poppins',
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #2D6A4F'}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(0, 0, 0, 0.04)'}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    transition: 'all 0.3s',
                  }}
                >
                  {t('send')}
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justify: 'center', color: '#8E8E9A', fontSize: '14px', fontFamily: 'Poppins' }}>
              {t('selectAgentChat')}
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .chat-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
