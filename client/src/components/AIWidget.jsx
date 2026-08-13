'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export default function AIWidget() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize and update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: t('aiIntro')
      }
    ]);
  }, [lang]);

  const suggestions = [
    { text: t('aiSug1'), query: t('aiSug1Q') },
    { text: t('aiSug2'), query: t('aiSug2Q') },
    { text: t('aiSug3'), query: t('aiSug3Q') },
    { text: t('aiSug4'), query: t('aiSug4Q') },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }
    setErrorMsg('');

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        conversationHistory: updatedMessages.slice(-6) // Send recent context
      });

      if (response.data.success) {
        const aiData = response.data.data;
        setIsFallback(!!aiData.isFallback);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: aiData.message }
        ]);
      } else {
        throw new Error(response.data.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setErrorMsg('AI Service temporary outage. Using fallback offline responder.');
      
      // Local fallback responder when server is disconnected or errors out
      setTimeout(() => {
        let localResponse = 'I apologize, but I\'m having trouble connecting right now. Please try again or contact our support team.';
        const lowerMsg = text.toLowerCase();
        
        if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rate')) {
          localResponse = 'Offline Mode: Coir prices range from ₹50/kg (raw fiber) to ₹500/kg (premium export-grade rope). For live specifications, check the Inventory page.';
        } else if (lowerMsg.includes('order') || lowerMsg.includes('buy') || lowerMsg.includes('purchase')) {
          localResponse = 'Offline Mode: Registered clients can request orders directly from their dashboard under the Browse Inventory screen.';
        } else if (lowerMsg.includes('deliver') || lowerMsg.includes('ship') || lowerMsg.includes('track')) {
          localResponse = 'Offline Mode: Standard domestic dispatch takes 5-7 days; export logistics takes 15-21 days. Check "My Orders" for real-time tracking.';
        } else if (lowerMsg.includes('quality') || lowerMsg.includes('grade')) {
          localResponse = 'Offline Mode: We offer Premium, Standard, Economy, Export, and Industrial grades. Each is certified for moisture control (<15%) and tensile strength.';
        }
        
        setIsFallback(true);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: localResponse }
        ]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 32px rgba(45, 106, 79, 0.3), 0 0 10px rgba(45, 106, 79, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          outline: 'none',
        }}
      >
        {isOpen ? '❌' : '🤖'}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '72px',
              right: 0,
              width: '360px',
              height: '500px',
              background: 'rgba(248, 245, 240, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(45, 106, 79, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255,255,255,0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'rgba(45, 106, 79, 0.05)',
              borderBottom: '1px solid rgba(45, 106, 79, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk', color: '#1A1A2E' }}>
                    {t('aiAssistant')}
                  </h4>
                  <span style={{ fontSize: '10px', color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block' }}></span>
                    {t('online')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#5C5C6B', fontSize: '18px', cursor: 'pointer', outline: 'none' }}
              >
                ×
              </button>
            </div>

            {/* Error Banner if any */}
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '11px',
                padding: '8px 16px',
                textAlign: 'center',
                fontFamily: 'Poppins'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Message Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      background: isUser ? '#2D6A4F' : 'var(--bg-card)',
                      border: isUser ? '1px solid #1B4332' : '1px solid var(--border)',
                      color: isUser ? '#FFFFFF' : 'var(--text-1)',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      fontSize: '12.5px',
                      lineHeight: 1.5,
                      fontFamily: 'Poppins',
                      boxShadow: isUser ? '0 2px 8px rgba(45, 106, 79, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    {msg.content}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 2px',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions list (only shown initially or when history is short) */}
            {messages.length <= 2 && !isTyping && (
              <div style={{
                padding: '0 20px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('suggestedQuestions')}:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.query)}
                      style={{
                        background: 'rgba(45, 106, 79, 0.05)',
                        border: '1px solid rgba(45, 106, 79, 0.15)',
                        color: '#2D6A4F',
                        fontSize: '11px',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(45, 106, 79, 0.12)';
                        e.target.style.borderColor = '#2D6A4F';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(45, 106, 79, 0.05)';
                        e.target.style.borderColor = 'rgba(45, 106, 79, 0.15)';
                      }}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div style={{
              padding: '16px 20px',
              background: 'rgba(0, 0, 0, 0.01)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('askAI')}
                disabled={isTyping}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: 'var(--text-1)',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'Poppins'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins',
                  outline: 'none'
                }}
              >
                {t('send')}
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
