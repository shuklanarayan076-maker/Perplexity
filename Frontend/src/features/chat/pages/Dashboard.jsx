import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import Sidebar from '../components/Sidebar';
import NewChatView from '../components/NewChatView';
import ChatInterface from '../components/ChatInterface';

const Dashboard = () => {
    const chat = useChat();
    const chats = useSelector((state) => state.chat.chats);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isLoading = useSelector((state) => state.chat.isLoading);
    const navigate = useNavigate();
    const [mode, setMode] = useState("normal");
    const [focus, setFocus] = useState("web");

    useEffect(() => {
        chat.initializeSocketConnection();
        chat.handleGetChats();
    }, []);

    const handleSendMessage = (message, messageMode = mode, messageFocus = focus) => {
        chat.handleSendMessage({ message, chatId: currentChatId, mode: messageMode, focus: messageFocus });
    };

    const handleOpenChat = (chatId) => {
        chat.handleOpenChat(chatId, chats);
    };

    const handleDeleteChat = (chatId) => {
        chat.handleDeleteChat(chatId);
    };

    const handleNewChat = () => {
        chat.handleNewChat();
    };

    const handleLogout = async () => {
        await chat.handleLogout();
        navigate('/login');
    };

    const currentMessages = chats[currentChatId]?.messages || [];

    return (
        <main className="flex h-screen w-full bg-bg-primary text-white font-sans overflow-hidden">
            {/* Sidebar with logic */}
            <Sidebar 
                onNewChat={handleNewChat}
                onOpenChat={handleOpenChat}
                onDeleteChat={handleDeleteChat}
                currentChatId={currentChatId}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <section className="flex-1 md:ml-65 h-screen overflow-hidden flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {!currentChatId ? (
                        <motion.div
                            key="new-chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex flex-col"
                        >
                            <NewChatView 
                                onSendMessage={handleSendMessage} 
                                mode={mode} 
                                setMode={setMode} 
                                focus={focus}
                                setFocus={setFocus}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active-chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex flex-col"
                        >
                            <ChatInterface 
                                messages={currentMessages} 
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading}
                                mode={mode}
                                setMode={setMode}
                                focus={focus}
                                setFocus={setFocus}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
};

export default Dashboard;
