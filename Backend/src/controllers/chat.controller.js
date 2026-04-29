import { generateResponse , generateChatTitle,generateCompareResponse,generateDebateResponse} from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


export async function sendMessage(req,res){
    try {
        const {message,chat:chatId, mode= "normal",focus = "web"} = req.body;

        let titlePromise = null, chat = null;
         
        if (!chatId) {
            // Start title generation in background
            titlePromise = generateChatTitle(message, focus);
            chat = await chatModel.create({
                user: req.user.id,
                title: "New Chat..." // Placeholder until promise resolves
            });
        } else {
            chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
            if (!chat) {
                return res.status(403).json({ message: "Unauthorized or chat not found", success: false });
            }
        }

           const userMessage = await messageModel.create({
            chat:chatId || chat._id,
            content:message,
            role:"user"
        })

        const messages = await messageModel.find({chat:chatId || chat._id})

        // Helper function to finalize title if needed
        const finalizeTitle = async () => {
            if (titlePromise) {
                const t = await titlePromise;
                await chatModel.findByIdAndUpdate(chat._id, { title: t });
                return t;
            }
            return chat.title;
        };

         if (mode === "compare"){
            const results = await generateCompareResponse(messages,focus)
            const geminiMessage = await messageModel.create({
                chat:chatId || chat._id,
                content: results.gemini,
                role: "gemini"
            })
            const mistralMessage = await messageModel.create({
                chat:chatId || chat._id,
                content: results.mistral,
                role: "mistral"
            })
            const finalTitle = await finalizeTitle();
            return res.status(201).json({
                title: finalTitle,
                chat,
                geminiMessage,
                mistralMessage,
                mode: "compare"
            })
         }

         if (mode === "debate"){
            const results = await generateDebateResponse(messages, focus)
            const proMessage = await messageModel.create({
                chat:chatId || chat._id,
                content: results.pro,
                role: "pro"
            })
           

            const conMessage = await messageModel.create({
                chat:chatId || chat._id,
                content: results.con,
                role: "con"
            })

            const finalTitle = await finalizeTitle();
            return res.status(201).json({
                title: finalTitle,
                chat,
                proMessage,
                conMessage,
                mode: "debate"
            })
         }

            const result = await generateResponse(messages,focus)
             const aiMessage = await messageModel.create({
            chat:chatId || chat._id,
            content:result,
            role:"ai"
        })
        
        const finalTitle = await finalizeTitle();

        res.status(201).json({
            title: finalTitle,
            chat,
            aiMessage,
            mode : "normal"
        })
    } catch (error) {
        console.error("SendMessage error:", error);
        res.status(500).json({
            message: "Failed to process message",
            success: false,
            error: error.message
        });
    }
}

export async function getChats(req,res){
    try {
        const user  = req.user
        const chats = await chatModel.find({user:user.id})
        res.status(200).json({
            message:"Chats fetched successfully",
            chats
        })
    } catch (error) {
        console.error("GetChats error:", error);
        res.status(500).json({ message: "Failed to fetch chats", success: false });
    }
}

export async function getMessages(req,res){
    try {
        const {chatId} = req.params
        const chat  = await chatModel.findOne({
            _id:chatId,
            user:req.user.id
        })

        if(!chat){
            return res.status(404).json({
                message:"Chat not found",
            })
        }
        const messages = await messageModel.find({chat:chatId})

        res.status(200).json({
            message:"Messages fetched successfully",
            messages
        })
    } catch (error) {
        console.error("GetMessages error:", error);
        res.status(500).json({ message: "Failed to fetch messages", success: false });
    }
}

export async function deleteChat(req,res){
    try {
        const {chatId} = req.params
        const chat  = await chatModel.findOneAndDelete({
            _id:chatId,
            user:req.user.id
        })

        if(!chat){
            return res.status(404).json({
                message:"Chat not found",
            })
        }

        await messageModel.deleteMany({chat:chatId})

        res.status(200).json({
            message:"Chat deleted successfully",
        })
    } catch (error) {
        console.error("DeleteChat error:", error);
        res.status(500).json({ message: "Failed to delete chat", success: false });
    }
}