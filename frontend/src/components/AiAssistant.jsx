import React, { useState, useRef, useEffect } from 'react';
import './AiAssistant.css';
import ApiService from '../services/api';

export default function AiAssistant({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: `Hi ${user.username || user.fullName || 'there'}! I'm your AI learning assistant. How can I help you today?`, isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await ApiService.chat(userMessage.text);
            setMessages(prev => [...prev, { text: response, isBot: true }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { text: "I'm having trouble connecting to the server. Please try again later.", isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`ai-assistant-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="ai-launcher" onClick={() => setIsOpen(true)}>
                    <span className="ai-icon">AI</span>
                    <span className="ai-label">Ask AI</span>
                </button>
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-header">
                        <h3>SkillForge AI</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot typing">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-input-area">
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}
