import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Image, Hash, ArrowUp, Plus, Newspaper, GraduationCap, MessagesSquare } from 'lucide-react';

const NewChatView = ({ onSendMessage, mode, setMode, focus, setFocus }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            const messageToSend = input.trim();
            setInput(''); // Clear immediately for instant reflection
            onSendMessage(messageToSend, mode);
        }
    };

    const suggestions = [
        "Explain quantum computing",
        "Best restaurants in Tokyo",
        "Recent AI news",
        "How to bake sourdough"
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[800px] space-y-10 relative z-10"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
                        Where knowledge begins
                    </h1>
                    <p className="text-text-muted text-lg">
                        Ask anything. Perplexity will search the web for you.
                    </p>
                </div>

                <div className="space-y-6">
                    <form 
                        onSubmit={handleSubmit}
                        className="relative glass-morphism p-2 rounded-[28px] shadow-2xl border-white/10 hover:border-white/20 transition-all focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
                    >
                        {/* Focus Mode Selector */}
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
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
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        focus === modeItem.id 
                                            ? 'bg-accent/10 text-accent border border-accent/20' 
                                            : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <modeItem.icon className="w-3.5 h-3.5" />
                                    {modeItem.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask anything..."
                            className="w-full bg-transparent border-none outline-none px-6 py-4 text-xl text-white placeholder:text-text-muted/50 resize-none custom-scrollbar"
                        />
                        
                        <div className="flex items-center justify-between px-4 pb-2">
                            <div className="flex items-center gap-1">
                                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 mr-2">
                                    <button 
                                        type="button"
                                        onClick={() => setMode("normal")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${mode === "normal" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                    >
                                        Normal
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setMode("compare")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${mode === "compare" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                    >
                                        Compare
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setMode("debate")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${mode === "debate" ? "bg-accent text-bg-secondary shadow-sm" : "text-text-muted hover:text-white"}`}
                                    >
                                        Debate
                                    </button>
                                </div>
                                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all">
                                    <Globe className="w-3.5 h-3.5" />
                                    Focus
                                </button>
                                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all">
                                    <Plus className="w-3.5 h-3.5" />
                                    Attach
                                </button>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-10 h-10 bg-accent hover:bg-accent-hover disabled:bg-white/5 disabled:text-text-muted text-bg-secondary rounded-full flex items-center justify-center transition-all shadow-lg shadow-accent/20"
                            >
                                <ArrowUp className="w-6 h-6" />
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap justify-center gap-3">
                        {suggestions.map((suggestion, i) => (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i + 0.5 }}
                                key={suggestion}
                                onClick={() => onSendMessage(suggestion)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-sm text-text-muted hover:text-white transition-all"
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NewChatView;
