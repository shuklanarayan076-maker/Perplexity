import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Bookmark, MoreHorizontal, ArrowUp, Globe, Newspaper, GraduationCap, MessagesSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Typewriter = ({ text, speed = 10, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm">{children}</code>,
                pre: ({ children }) => (
                    <pre className="bg-bg-secondary p-4 rounded-2xl border border-white/5 overflow-x-auto my-6 custom-scrollbar">
                        <code className="text-sm">{children}</code>
                    </pre>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted">{children}</blockquote>
            }}
        >
            {displayedText}
        </ReactMarkdown>
    );
};

const ResearchCard = ({ content }) => {
    const lines = content.split('\n');
    const subQuestions = lines.filter(l => l.trim() && l.match(/^\d+\./));

    return (
        <div className="w-full bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-6 shadow-xl shadow-purple-500/5 mb-8">
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Search className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">🔬 AI Research Pipeline</h3>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Multi-source knowledge synthesis</p>
                </div>
            </div>
            <div className="space-y-3">
                <p className="text-sm font-bold text-purple-300/80 uppercase tracking-wider">Sub-questions explored:</p>
                <ul className="space-y-2.5">
                    {subQuestions.map((q, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-white/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
                            <span className="text-purple-400 font-bold">{i + 1}.</span>
                            <span>{q.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const LoadingState = ({ mode }) => {
    const [step, setStep] = useState(0);
    const steps = {
        normal: ["Searching the web...", "Generating answer..."],
        research: ["🧠 Planning research...", "🔍 Searching sources...", "✍️ Synthesizing answer..."],
        compare: ["Running both models in parallel..."],
        debate: ["Preparing arguments..."]
    };
    
    const currentSteps = steps[mode] || steps.normal;
    
    useEffect(() => {
        if (currentSteps.length > 1) {
            const interval = setInterval(() => {
                setStep(prev => (prev + 1) % currentSteps.length);
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [currentSteps]);

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-accent font-medium"
        >
            <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
            <span className="text-sm tracking-widest uppercase font-black bg-accent/10 px-3 py-1 rounded-lg border border-accent/20">
                {currentSteps[step]}
            </span>
        </motion.div>
    );
};

const ChatInterface = ({ messages, onSendMessage, isLoading, mode, setMode, focus, setFocus }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            const messageToSend = input.trim();
            setInput(''); // Instant reflection: clear input immediately
            onSendMessage(messageToSend, mode);
        }
    };
    const markdownComponents = {
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm">{children}</code>,
        pre: ({ children }) => (
            <pre className="bg-bg-secondary p-4 rounded-2xl border border-white/5 overflow-x-auto my-6 custom-scrollbar">
                <code className="text-sm">{children}</code>
            </pre>
        ),
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted">{children}</blockquote>
    };

    const renderMessageContent = (message, isLast) => {
        const isAiResponse = ['ai', 'gemini', 'mistral', 'pro', 'con'].includes(message.role);
        
        if (message.role === 'user') {
            return (
                <div className="bg-blue-600 text-white px-5 py-3.5 rounded-3xl rounded-tr-sm shadow-sm inline-block max-w-[85%] md:max-w-[70%]">
                    <h3 className="text-[15px] leading-relaxed">
                        {message.content}
                    </h3>
                </div>
            );
        }

        if (message.role === 'research') {
            return <ResearchCard content={message.content} />;
        }

        return (
            <div className="prose prose-invert max-w-none text-[15px] md:text-base leading-relaxed text-white/90">
                {isLast && isAiResponse && message.isNew ? (
                    <Typewriter text={message.content} onComplete={scrollToBottom} />
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
        );
    };

    const FocusBadge = ({ focus }) => {
        if (!focus) return null;
        const modes = {
            web: { label: 'Web', icon: Globe },
            news: { label: 'News', icon: Newspaper },
            academic: { label: 'Academic', icon: GraduationCap },
            forums: { label: 'Forums', icon: MessagesSquare },
        };
        const mode = modes[focus.toLowerCase()] || { label: focus, icon: Globe };
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <mode.icon className="w-3 h-3" />
                {mode.label}
            </div>
        );
    };

    const renderMessages = () => {
        const elements = [];
        for (let i = 0; i < messages.length; i++) {
            const current = messages[i];
            const next = messages[i + 1];

            // Check for Compare Mode Pair (Gemini + Mistral)
            if (current.role === 'gemini' && next?.role === 'mistral') {
                const isLastPair = i + 1 === messages.length - 1;
                elements.push(
                    <motion.div
                        initial={current.isNew || next?.isNew ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        key={`compare-${i}`}
                        className="w-full space-y-6 mb-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Gemini Panel */}
                            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-sm hover:border-blue-500/30 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/20 shadow-sm shadow-blue-500/10">L</div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Llama 70B</span>
                                    </div>
                                    <FocusBadge focus={current.focus} />
                                </div>
                                {renderMessageContent(current, isLastPair)}
                            </div>

                            {/* Mistral Panel */}
                            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-sm hover:border-orange-500/30 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold border border-orange-500/20 shadow-sm shadow-orange-500/10">L</div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-orange-400/80">Llama 8B</span>
                                    </div>
                                    <FocusBadge focus={next.focus} />
                                </div>
                                {renderMessageContent(next, isLastPair)}
                            </div>
                        </div>
                    </motion.div>
                );
                i++; // Skip the next message as it's paired
                continue;
            }

            // Check for Debate Mode Pair (Pro + Con)
            if (current.role === 'pro' && next?.role === 'con') {
                const isLastPair = i + 1 === messages.length - 1;
                elements.push(
                    <motion.div
                        initial={current.isNew || next?.isNew ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        key={`debate-${i}`}
                        className="w-full space-y-6 mb-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pro Panel */}
                            <div className="flex flex-col gap-4 p-0 rounded-3xl bg-green-500/5 border border-green-500/20 shadow-sm overflow-hidden">
                                <div className="bg-green-500/10 px-6 py-3 border-b border-green-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">PRO ✅</span>
                                    </div>
                                    <FocusBadge focus={current.focus} />
                                </div>
                                <div className="p-6">
                                    {renderMessageContent(current, isLastPair)}
                                </div>
                            </div>

                            {/* Con Panel */}
                            <div className="flex flex-col gap-4 p-0 rounded-3xl bg-red-500/5 border border-red-500/20 shadow-sm overflow-hidden">
                                <div className="bg-red-500/10 px-6 py-3 border-b border-red-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400">CON ❌</span>
                                    </div>
                                    <FocusBadge focus={next.focus} />
                                </div>
                                <div className="p-6">
                                    {renderMessageContent(next, isLastPair)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
                i++; // Skip the next message as it's paired
                continue;
            }

            // Single Message (User or Normal AI or Research)
            const isLastMessage = i === messages.length - 1;
            elements.push(
                <motion.div
                    initial={current.isNew ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    key={i}
                    className="space-y-4 max-w-full"
                >
                    <div className={`flex items-start gap-4 ${current.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {current.role !== 'user' && current.role !== 'research' && (
                            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/20 shadow-sm shadow-accent/5">
                                P
                            </div>
                        )}
                        <div className={`flex flex-col space-y-4 ${current.role === 'user' ? 'items-end w-full' : 'flex-1 min-w-0'}`}>
                            {['ai', 'gemini', 'mistral', 'pro', 'con'].includes(current.role) && (
                                <div className="mb-1">
                                    <FocusBadge focus={current.focus} />
                                </div>
                            )}
                            {renderMessageContent(current, isLastMessage)}
                        </div>
                    </div>
                    {['ai', 'gemini', 'mistral', 'pro', 'con'].includes(current.role) && (
                        <div className="flex items-center gap-4 ml-12 pt-2 pb-8">
                            <button className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1.5">
                                <MoreHorizontal className="w-4 h-4" />
                                Related
                            </button>
                        </div>
                    )}
                </motion.div>
            );
        }
        return elements;
    };

    return (
        <div className="flex-1 flex flex-col h-screen max-w-4xl mx-auto w-full relative">
            {/* Header / Actions */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold truncate max-w-50 md:max-w-md text-white/90">
                        {messages[0]?.content.substring(0, 40) || "New Thread"}...
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all">
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 space-y-8 pb-40 w-full">
                {renderMessages()}
                {isLoading && (
                    <div className="flex items-start gap-4 py-4">
                        <LoadingState mode={mode} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Bottom Input */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-linear-to-t from-bg-primary via-bg-primary to-transparent">
                <form 
                    onSubmit={handleSubmit}
                    className="max-w-3xl mx-auto relative glass-morphism p-2 rounded-3xl shadow-2xl border-white/10 shadow-black/40 focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/5 transition-all"
                >
                    {/* Focus Mode Selector */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2 overflow-x-auto scrollbar-none snap-x">
                        {[
                            { id: 'web', label: 'Web', icon: Globe },
                            { id: 'news', label: 'News', icon: Newspaper },
                            { id: 'academic', label: 'Academic', icon: GraduationCap },
                            { id: 'forums', label: 'Forums', icon: MessagesSquare },
                        ].map((modeItem) => (
                            <button
                                key={modeItem.id}
                                type="button"
                                onClick={() => setFocus(modeItem.id)}
                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all snap-start border-2 ${
                                    focus === modeItem.id 
                                        ? 'bg-accent/10 text-accent border-accent shadow-lg shadow-accent/20' 
                                        : 'text-text-muted hover:text-white hover:bg-white/10 border-white/10'
                                }`}
                            >
                                <modeItem.icon className="w-3.5 h-3.5" />
                                {modeItem.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Ask a follow up..."
                        className="w-full bg-transparent border-none outline-none px-6 py-4 text-white placeholder:text-text-muted/50 resize-none max-h-40 custom-scrollbar"
                    />
                    
                    <div className="flex items-center justify-between px-4 pb-2">
                        <div className="flex items-center gap-1">
                            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 mr-2">
                                <button 
                                    type="button"
                                    onClick={() => setMode("normal")}
                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all ${mode === "normal" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                >
                                    💬 Normal
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMode("compare")}
                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all ${mode === "compare" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                >
                                    ⚖️ Compare
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMode("debate")}
                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all ${mode === "debate" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                >
                                    🥊 Debate
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMode("research")}
                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all ${mode === "research" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                >
                                    🔬 Research
                                </button>
                            </div>
                            <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${focus && focus !== 'web' ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}`}>
                                {focus === 'news' ? <Newspaper className="w-3.5 h-3.5" /> : 
                                 focus === 'academic' ? <GraduationCap className="w-3.5 h-3.5" /> : 
                                 focus === 'forums' ? <MessagesSquare className="w-3.5 h-3.5" /> : 
                                 <Globe className="w-3.5 h-3.5" />}
                                {focus ? focus.charAt(0).toUpperCase() + focus.slice(1) : 'Focus'}
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="flex-shrink-0 w-8 h-8 bg-accent hover:bg-accent-hover disabled:bg-white/5 disabled:text-text-muted text-bg-secondary rounded-full flex items-center justify-center transition-all shadow-lg"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;

