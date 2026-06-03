'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import useSocket from '../../../hooks/useSocket';
import api from '../../../lib/api';
import { useLanguage } from '../../../context/LanguageContext';

export default function AdminSupportChat() {
  const { user } = useAuth();
  const socket = useSocket();
  const { t } = useLanguage();

  const [chats, setChats] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [clientTyping, setClientTyping] = useState(false);
  const [viewMode, setViewMode] = useState('chats'); // 'chats' or 'clients'

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, clientTyping]);

  // Load existing active chats
  useEffect(() => {
    fetchActiveChats();
  }, []);

  // Load client directory (for starting a new support chat)
  useEffect(() => {
    if (viewMode === 'clients') {
      fetchClients();
    }
  }, [viewMode]);

  const fetchActiveChats = async () => {
    try {
      setLoadingChats(true);
      const res = await api.get('/chat');
      if (res.data.success) {
        setChats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await api.get('/users?role=client');
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Socket connection handling for admin room joining
  useEffect(() => {
    if (!socket || !activeChat) return;

    // Join room for this chat
    socket.emit('join-chat', activeChat._id);

    // Message handler
    const handleNewMessage = (msg) => {
      if (msg.chatId === activeChat._id || msg.chat === activeChat._id) {
        setMessages((prev) => [...prev, msg]);
        setClientTyping(false);
      }
      // Refresh chat list to show last message update
      fetchActiveChats();
    };

    // Typing handlers
    const handleUserTyping = (data) => {
      if (data.chatId === activeChat._id && data.userId !== user._id) {
        setClientTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.chatId === activeChat._id && data.userId !== user._id) {
        setClientTyping(false);
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

  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    // Find the participant (the client)
    const clientParticipant = chat.participants.find(p => p._id !== user._id);
    setSelectedClient(clientParticipant);
    
    try {
      setLoadingMessages(true);
      const res = await api.get(`/chat/${chat._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleStartChatWithClient = async (client) => {
    setSelectedClient(client);
    try {
      setLoadingMessages(true);
      const res = await api.post('/chat', { participantId: client._id });
      if (res.data.success) {
        const chat = res.data.data;
        setActiveChat(chat);
        setViewMode('chats');
        
        // Fetch messages
        const msgRes = await api.get(`/chat/${chat._id}/messages`);
        if (msgRes.data.success) {
          setMessages(msgRes.data.data);
        }
        fetchActiveChats(); // refresh lists
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    if (socket) {
      socket.emit('stop-typing', { chatId: activeChat._id, userId: user._id });
      setIsTyping(false);
    }

    try {
      const res = await api.post(`/chat/${activeChat._id}/messages`, { content: messageText });
      if (res.data.success) {
        const msg = res.data.data;
        setMessages((prev) => [...prev, msg]);

        if (socket) {
          socket.emit('send-message', {
            ...msg,
            chatId: activeChat._id,
          });
        }
        fetchActiveChats();
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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { chatId: activeChat._id, userId: user._id });
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk', color: '#F0EBE0', marginBottom: '6px' }}>
          {t('opsSupportDesk')}
        </h1>
        <p style={{ color: '#A09888', fontSize: '14px', fontFamily: 'Poppins' }}>
          {t('opsChatDesc')}
        </p>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        overflow: 'hidden',
      }} className="chat-grid-responsive">

        {/* Left Side Navigation & Directory */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', padding: '12px' }}>
            <button
              onClick={() => setViewMode('chats')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: viewMode === 'chats' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                color: viewMode === 'chats' ? '#C9A84C' : '#8A8070',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Poppins'
              }}
            >
              {t('activeChatsTab')}
            </button>
            <button
              onClick={() => setViewMode('clients')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: viewMode === 'clients' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                color: viewMode === 'clients' ? '#C9A84C' : '#8A8070',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Poppins'
              }}
            >
              {t('clientContactsTab')}
            </button>
          </div>

          {/* Directory Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {viewMode === 'chats' ? (
              loadingChats ? (
                <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                  {t('loadingChatThreads')}
                </div>
              ) : chats.length === 0 ? (
                <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', marginTop: '24px', padding: '0 12px' }}>
                  {t('noActiveChatsDesc')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chats.map((chat) => {
                    const client = chat.participants.find(p => p._id !== user._id) || {};
                    const isSelected = activeChat?._id === chat._id;
                    return (
                      <button
                        key={chat._id}
                        onClick={() => handleSelectChat(chat)}
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
                          background: isSelected ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #C9A84C' : '3px solid transparent',
                          color: isSelected ? '#C9A84C' : '#F0EBE0',
                          width: '100%',
                        }}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #A09888, #C9A84C)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#08080F', fontWeight: 700, fontSize: '13px'
                        }}>
                          {client.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {client.name || t('unknownClient')}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8A8070', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {chat.lastMessage?.content || t('noMessagesYet')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              loadingClients ? (
                <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                  {t('loadingClientsList')}
                </div>
              ) : clients.length === 0 ? (
                <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
                  {t('noBuyersRegistered')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clients.map((client) => {
                    return (
                      <button
                        key={client._id}
                        onClick={() => handleStartChatWithClient(client)}
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
                          background: 'transparent',
                          color: '#F0EBE0',
                          width: '100%',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.01)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #555, #888)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#08080F', fontWeight: 700, fontSize: '13px'
                        }}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {client.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8A8070' }}>
                            {client.company || 'Buyer'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(8, 8, 15, 0.4)' }}>
          {activeChat && selectedClient ? (
            <>
              {/* Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A09888, #C9A84C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#08080F', fontWeight: 700, fontSize: '13px'
                }}>
                  {selectedClient.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F0EBE0' }}>{selectedClient.name}</h4>
                  <div style={{ fontSize: '11px', color: '#8A8070' }}>
                    {t('buyerRepFrom')} <strong style={{ color: '#C9A84C' }}>{selectedClient.company || 'Indiv.'}</strong>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loadingMessages ? (
                  <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>
                    {t('loadingMessageLogs')}
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ color: '#8A8070', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>
                    {t('noMessagesThread')}
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
                          background: isMe ? 'linear-gradient(135deg, #8B6914 0%, #C9A84C 100%)' : 'rgba(255,255,255,0.03)',
                          border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          color: isMe ? '#08080F' : '#F0EBE0',
                          fontSize: '13.5px',
                          lineHeight: 1.5,
                          fontFamily: 'Poppins',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                          <div>{msg.content}</div>
                          <div style={{
                            fontSize: '9px',
                            color: isMe ? 'rgba(8, 8, 15, 0.6)' : '#8A8070',
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
                
                {/* Client Typing Indicator */}
                {clientTyping && (
                  <div style={{ display: 'flex', justify: 'flex-start' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', color: '#8A8070', fontSize: '12px' }}>
                      {selectedClient.name} {t('isTypingText')}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={t('typeSupportReplyPlaceholder')}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#F0EBE0',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    fontFamily: 'Poppins',
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #C9A84C'}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)'}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 100%)',
                    color: '#08080F',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    transition: 'all 0.3s',
                  }}
                >
                  {t('replyBtn')}
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justify: 'center', color: '#8A8070', fontSize: '14px', fontFamily: 'Poppins' }}>
              {t('selectBuyerThreadDesc')}
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
