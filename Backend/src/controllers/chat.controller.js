import { generateResponse , generateChatTitle,generateCompareResponse,generateDebateResponse,generateResearchResponse} from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


export async function sendMessage(req,res){
    try {
        const {message,chat:chatId, mode= "normal",focus = "web"} = req.body;

        let chat = null;
        let isNewChat = false;
         
        if (!chatId) {
            isNewChat = true;
            chat = await chatModel.create({
                user: req.user.id,
                title: "New Chat..."
            });
            // FIRE AND FORGET: Generate title in background without awaiting
            generateChatTitle(message, focus).then(title => {
                chatModel.findByIdAndUpdate(chat._id, { title }).catch(console.error);
            });
        } else {
            chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
            if (!chat) {
                return res.status(403).json({ message: "Unauthorized or chat not found", success: false });
            }
        }

        // Save User Message
        const userMessage = await messageModel.create({
            chat: chat._id,
            content: message,
            role: "user",
            focus
        });

        const history = await messageModel.find({ chat: chat._id });

         if (mode === "compare"){
            const results = await generateCompareResponse(history, focus);
            
            const [geminiMsg, mistralMsg] = await Promise.all([
                messageModel.create({ chat: chat._id, content: results.gemini, role: "gemini", focus }),
                messageModel.create({ chat: chat._id, content: results.mistral, role: "mistral", focus })
            ]);

            return res.status(201).json({
                chat,
                geminiMessage: geminiMsg,
                mistralMessage: mistralMsg,
                mode: "compare"
            });
         }

         if (mode === "debate"){
            const results = await generateDebateResponse(history, focus);
            
            const [proMsg, conMsg] = await Promise.all([
                messageModel.create({ chat: chat._id, content: results.pro, role: "pro", focus }),
                messageModel.create({ chat: chat._id, content: results.con, role: "con", focus })
            ]);

            return res.status(201).json({
                chat,
                proMessage: proMsg,
                conMessage: conMsg,
                mode: "debate"
            });
         }

         if (mode === "research") {
  const result = await generateResearchResponse(
    message,
    (step) => console.log(step)
  )

  // Save individual findings
  for (const finding of result.findings) {
    await messageModel.create({
      chat: chat._id,
      content: `**${finding.subQuestion}**\n\n${finding.finding}`,
      role: "research",
      focus
    })
  }

  // Save final synthesized answer
  const finalMessage = await messageModel.create({
    chat: chat._id,
    content: result.finalAnswer,
    role: "ai",
    focus
  })

  return res.status(201).json({
    chat,
    subQuestions: result.subQuestions,
    findings: result.findings,
    finalMessage,
    mode: "research"
  })
}

        // Normal Mode
        const result = await generateResponse(history, focus);
        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: result,
            role: "ai",
            focus
        });

        return res.status(201).json({
            chat,
            aiMessage,
            mode: "normal"
        });

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
        const chats = await chatModel.find({user:user.id}).sort({ updatedAt: -1 })
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
        const messages = await messageModel.find({chat:chatId}).sort({ createdAt: 1 })

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