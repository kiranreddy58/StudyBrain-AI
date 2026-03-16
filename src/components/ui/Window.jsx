import { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { MessageSquare, X, Minus, Square, Send } from 'lucide-react';
import './Window.css';

const API = '/api';

export default function Window({ id, title, onClose, initialPos = { x: 50, y: 50 } }) {
  const nodeRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello! I am your AI study assistant for **${title}**. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      // In a real app we might pass the document ID, but passing the title as context constraint works
      const res = await fetch(`${API}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query + ` (Context: ${title})` }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.answer || "No response received." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "⚠️ Failed to reach the StudyBrain API." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      defaultPosition={initialPos}
      bounds="parent"
    >
      <div ref={nodeRef} className="window-container">
        <div className="window-header">
          <div className="window-title">
            <MessageSquare size={14} color="var(--color-accent)" />
            <span>{title}</span>
          </div>
          <div className="window-controls">
            <button className="window-control minimize" />
            <button className="window-control maximize" />
            <button className="window-control close" onClick={onClose} />
          </div>
        </div>

        <div className="window-content">
          <div className="chat-container">
            <div className="chat-history">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              ))}
              {isTyping && <div className="chat-bubble assistant" style={{opacity: 0.6}}>Looking through your documents...</div>}
            </div>

            <div className="chat-input-area">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Ask document..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="btn-send" onClick={handleSend} disabled={isTyping} style={{ opacity: isTyping ? 0.5 : 1 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
