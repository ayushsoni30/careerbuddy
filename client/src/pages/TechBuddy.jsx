import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Plus, Send } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function TechBuddy() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/tech-buddy/history');
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    setLoadingHistory(true);
    setCurrentSessionId(sessionId);
    try {
      const response = await api.get(`/tech-buddy/history/${sessionId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      toast({
        title: 'Load Failure',
        description: 'Failed to load conversation history.'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    const newSessionId = `session-${Math.random().toString(36).substring(2, 11)}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setInput('');
  };

  // If no current session is active, generate one or select the latest session
  useEffect(() => {
    if (!currentSessionId) {
      if (sessions.length > 0) {
        loadSession(sessions[0].sessionId);
      } else {
        startNewChat();
      }
    }
  }, [sessions, currentSessionId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Append user message immediately locally
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await api.post('/tech-buddy/chat', {
        sessionId: currentSessionId,
        message: userMessage
      });

      if (response.data.success) {
        setMessages([
          ...updatedMessages,
          { role: 'model', content: response.data.reply, timestamp: new Date() }
        ]);
        // Refresh sessions to update titles and list
        fetchSessions();
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Communication Error',
        description: error.response?.data?.error || 'Failed to receive a response.'
      });
      // Remove the last user message on failure to keep log accurate
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 144px)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Tech Buddy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Discuss roadmap planning, computer science concepts, or software development questions.</p>
      </div>

      <div 
        className="card" 
        style={{ 
          display: 'flex', 
          flexGrow: 1, 
          padding: 0, 
          overflow: 'hidden', 
          height: '100%',
          gridTemplateColumns: '240px 1fr'
        }}
      >
        {/* Left Side: Past Sessions List */}
        <div 
          style={{ 
            width: '240px', 
            borderRight: '1px solid var(--border-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--bg-primary)',
            flexShrink: 0
          }}
        >
          <div style={{ padding: '16px' }}>
            <button 
              onClick={startNewChat} 
              className="button" 
              style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
            >
              <Plus size={14} /> New Chat
            </button>
          </div>
          <div style={{ overflowY: 'auto', flexGrow: 1, padding: '0 8px 16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 8px' }}>
              Past Chats
            </div>
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => loadSession(s.sessionId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentSessionId === s.sessionId ? 'var(--active-bg)' : 'transparent',
                  color: currentSessionId === s.sessionId ? 'var(--accent)' : 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'background-color 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <MessageSquare size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
              </button>
            ))}
            {sessions.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No history found
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', backgroundColor: 'var(--bg-card)' }}>
          {/* Messages Scroll Panel */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px' }}>
                <span className="spinner" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Retrieving logs...</span>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div 
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-primary)',
                        color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: '1.6'
                      }}
                    >
                      {/* Avatar initial */}
                      <div 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', 
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {msg.role === 'user' ? 'You' : 'Tech Buddy'}
                      </div>
                      
                      {msg.role === 'user' ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                    <div 
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span className="spinner" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tech Buddy is writing...</span>
                    </div>
                  </div>
                )}

                {messages.length === 0 && !loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                    <MessageSquare size={48} style={{ color: 'var(--border-color)' }} />
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Start a New Tech Chat</h3>
                    <p style={{ fontSize: '0.85rem', maxWidth: '360px' }}>
                      Ask for roadmap details, conceptual explanations, debug software issues, or request career advice.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Form Message Bar */}
          <form 
            onSubmit={handleSend}
            style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid var(--border-color)', 
              display: 'flex', 
              gap: '12px',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <input
              type="text"
              className="input"
              placeholder="Ask anything about tech..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || loadingHistory}
              style={{ flexGrow: 1 }}
            />
            <button
              type="submit"
              className="button"
              disabled={loading || loadingHistory || !input.trim()}
              style={{ flexShrink: 0, padding: '12px' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
