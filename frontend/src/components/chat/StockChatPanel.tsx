"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export interface StockChatPanelProps {
    symbol?: string;
    stockName?: string;
    initialContext?: {
        price: number;
        changePercent: number;
        sentiment: number;
        verdict: string;
        newsHeadlines: string[];
    };
    embedded?: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function StockChatPanel({ symbol, stockName, initialContext, embedded = false }: StockChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your TradeVision AI assistant. ${symbol ? `I have live data for ${stockName || symbol} — ask me anything about it.` : 'Ask me anything about Indian stocks, SIP, portfolio strategy, or market trends.'}`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cancelRef = useRef<boolean>(false);

    useEffect(() => {
        // Fetch suggestions on mount
        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`/api/chat/suggestions${symbol ? `?symbol=${encodeURIComponent(symbol)}` : ''}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (err) {
                console.error("Failed to load suggestions", err);
            }
        };
        fetchSuggestions();
    }, [symbol]);

    useEffect(() => {
        return () => {
            cancelRef.current = true;
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isStreaming) return;

        const userMessage: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setIsStreaming(true);
        setError(null);
        cancelRef.current = false;

        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    symbol,
                    stockContext: initialContext,
                    history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || (response.status === 429 ? "Rate limit exceeded. Please try again later." : "Failed to fetch response."));
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                if (cancelRef.current) {
                    reader.cancel();
                    break;
                }
                const { done, value } = await reader.read();
                if (done) break;

                const decodedChunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last.role === 'assistant') {
                        next[next.length - 1] = { ...last, content: last.content + decodedChunk };
                    }
                    return next;
                });
            }
        } catch (err: any) {
            console.error("Chat error:", err);
            setError(err.message || "An error occurred.");
            setMessages(prev => {
                const next = [...prev];
                if (next[next.length - 1].role === 'assistant' && next[next.length - 1].content === '') {
                    next[next.length - 1] = { ...next[next.length - 1], content: `Error: ${err.message}` };
                }
                return next;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: embedded ? 'auto' : 'clamp(320px, 60vh, 420px)',
            minHeight: embedded ? '300px' : 'auto',
            width: '100%',
            overflow: 'hidden'
        }}>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .scroll-area::-webkit-scrollbar {
                    width: 6px;
                }
                .scroll-area::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scroll-area::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
            
            {/* Header */}
            {!embedded && (
                <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                        animation: isStreaming ? 'pulse 2s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>AI Assistant</span>
                    {symbol && (
                        <span style={{ 
                            fontSize: '10px', background: 'rgba(255,255,255,0.1)', 
                            padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' 
                        }}>
                            {symbol}
                        </span>
                    )}
                </div>
            )}

            {/* Messages Area */}
            <div className="scroll-area" style={{ 
                flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' 
            }}>
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={idx} style={{
                            alignSelf: isUser ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{
                                background: isUser ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--surface, #1e1e2d)',
                                color: isUser ? 'white' : 'var(--foreground, #e2e8f0)',
                                padding: '10px 14px',
                                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                border: isUser ? 'none' : '1px solid var(--border, rgba(255,255,255,0.1))',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {msg.content}
                                {!isUser && isStreaming && idx === messages.length - 1 && (
                                    <span style={{ 
                                        display: 'inline-block', width: '6px', height: '14px', 
                                        background: 'currentColor', marginLeft: '4px', animation: 'blink 1s infinite', verticalAlign: 'middle'
                                    }} />
                                )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'gray', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                
                {messages.length === 1 && suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {suggestions.map((chip, i) => (
                            <button key={i} onClick={() => sendMessage(chip)} disabled={isStreaming} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px', padding: '6px 12px', fontSize: '12px', color: 'var(--foreground)',
                                cursor: isStreaming ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                {chip}
                            </button>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border, rgba(255,255,255,0.1))' }}>
                <div style={{ position: 'relative' }}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about the market..."
                        disabled={isStreaming}
                        rows={1}
                        style={{
                            width: '100%',
                            resize: 'none',
                            borderRadius: '12px',
                            padding: '10px 50px 10px 14px',
                            fontSize: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border, rgba(255,255,255,0.2))',
                            color: 'inherit',
                            outline: 'none',
                            fontFamily: 'inherit',
                            maxHeight: '100px'
                        }}
                    />
                    <button 
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isStreaming}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            bottom: '8px',
                            background: 'none',
                            border: 'none',
                            color: input.trim() && !isStreaming ? '#8b5cf6' : 'gray',
                            cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Send size={18} className={isStreaming ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div style={{ fontSize: '10px', color: 'gray', textAlign: 'center', marginTop: '8px', opacity: 0.75 }}>
                    TradeVision is not SEBI-registered. All content is for educational/informational purposes only. Consult a SEBI-registered advisor before investing.
                </div>
            </div>
        </div>
    );
}
