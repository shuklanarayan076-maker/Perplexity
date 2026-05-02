import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, logout } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, removeChat, replaceChatId } from "../chat.slice";
import { useDispatch } from "react-redux";
import { setUser } from "../../auth/auth.slice";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId, mode = "normal",focus = "web"}) {
        let activeChatId = chatId;
        const isNewChat = !chatId || (typeof chatId === 'string' && chatId.startsWith('temp-'));

        // 1. Optimistic Update: Create chat or add message immediately
        if (isNewChat) {
            activeChatId = `temp-${Date.now()}`;
            dispatch(createNewChat({
                chatId: activeChatId,
                title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
            }));
            dispatch(setCurrentChatId(activeChatId));
        }

        dispatch(addNewMessage({
            chatId: activeChatId,
            content: message,
            role: "user",
        }));

        try {
            dispatch(setLoading(true))
            const data = await sendMessage({ message, chatId: isNewChat ? null : chatId,mode ,focus})
            
            if (!data || !data.chat) {
                console.error("No chat data received from server");
                return;
            }

            const { chat} = data

            // 2. If it was a new chat, swap temp ID for real ID
            if (isNewChat) {
                dispatch(replaceChatId({ oldId: activeChatId, newId: chat._id }));
                activeChatId = chat._id;
            }

            if (mode === "compare") {
                if (data.geminiMessage) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: data.geminiMessage.content,
                        role: "gemini",
                        focus: focus,
                        isNew: true
                    }))
                }
                if (data.mistralMessage) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: data.mistralMessage.content,
                        role: "mistral",
                        focus: focus,
                        isNew: true
                    }))
                }
            } else if (mode === "debate") {
                if (data.proMessage) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: data.proMessage.content,
                        role: "pro",
                        focus: focus,
                        isNew: true
                    }))
                }
                if (data.conMessage) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: data.conMessage.content,
                        role: "con",
                        focus: focus,
                        isNew: true
                    }))
                }
            } else if (mode === "research") {
                if (data.subQuestions) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: `🔍 Research Pipeline:\n${data.subQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
                        role: "research",
                        focus: focus,
                        isNew: true
                    }))
                }
                if (data.finalMessage) {
                    dispatch(addNewMessage({
                        chatId: activeChatId,
                        content: data.finalMessage.content,
                        role: "ai",
                        focus: focus,
                        isNew: true
                    }))
                }
            } else if (data.aiMessage) {
                dispatch(addNewMessage({
                    chatId: activeChatId,
                    content: data.aiMessage.content,
                    role: data.aiMessage.role || "ai",
                    focus: focus,
                    isNew: true
                }))
            }
        } catch (error) {
            console.error("Failed to send message:", error)
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        try {
            dispatch(setLoading(true))
            const data = await getChats()
            const chats = data?.chats || []
            
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            console.error("Failed to get chats:", error)
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId, chats) {
        if (!chatId || !chats || !chats[ chatId ]) return;

        const currentChat = chats[ chatId ];

        if (!currentChat.messages || currentChat.messages.length === 0) {
            try {
                const data = await getMessages(chatId)
                const messages = data?.messages || []

                const formattedMessages = messages.map(msg => ({
                    content: msg.content,
                    role: msg.role,
                    focus: msg.focus || null
                }))

                dispatch(addMessages({
                    chatId,
                    messages: formattedMessages,
                }))
            } catch (error) {
                console.error("Failed to load messages:", error)
            }
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
        } catch (error) {
            console.error("Failed to delete chat:", error)
        }
    }

    function handleNewChat() {
        dispatch(setCurrentChatId(null))
    }

    async function handleLogout(){
        await logout()
        dispatch(setChats({}))
        dispatch(setCurrentChatId(null))
        dispatch(setUser(null))
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleNewChat,
        handleLogout
    }

}


