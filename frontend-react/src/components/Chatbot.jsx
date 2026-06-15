import React, { useState, useRef, useEffect } from 'react';

const API_KEY = 'AIzaSyCNqmXYsEDEuQmk6UKZwROa5_RLPk0oH_M';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your Life4U Assistant. How can I help you save lives today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'Am I eligible to donate blood?',
    'How do I book an appointment?',
    'What are the benefits of donating?',
    'What should I eat before donating?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    // Add user message
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const contents = newMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: 'You are Life4U Assistant, a helpful AI assistant for the Life4U Blood Donation platform. You help users with questions about blood donation eligibility, booking appointments, emergency requests, rewards program, and general platform info. Always be polite, encouraging, and clear. Keep answers concise.' }]
          }
        })
      });

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (error) {
      console.error('Error contacting Gemini API:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please check your internet connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF3366 0%, #FF6B8B 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 51, 102, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          className="hover:scale-110"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '500px',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #ffe5e5',
          animation: 'fadeInUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #FF3366 0%, #FF6B8B 100%)',
            padding: '16px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🩸</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Life4U Assistant</div>
                <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }}></span> Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', opacity: 0.8 }}
              className="hover:opacity-100"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#FFF5F5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isUser ? 'linear-gradient(135deg, #FF3366 0%, #FF6B8B 100%)' : '#fff',
                    color: isUser ? '#fff' : '#333',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </div>
              );
            })}
            
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#fff',
                color: '#888',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Thinking</span>
                <span className="animate-pulse">.</span>
                <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Only show when there is only welcome message or to prompt input) */}
          {messages.length === 1 && !isLoading && (
            <div style={{
              background: '#FFF5F5',
              padding: '0 20px 12px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Suggested Questions:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {quickQuestions.map((qq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qq)}
                    style={{
                      background: '#fff',
                      border: '1px solid #ffe5e5',
                      borderRadius: '12px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: '#FF3366',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    className="hover:bg-primary hover:text-white"
                  >
                    {qq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #ffe5e5',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            background: '#fff'
          }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '24px',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: input.trim() && !isLoading ? 'linear-gradient(135deg, #FF3366 0%, #FF6B8B 100%)' : '#cbd5e1',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
