import { generateResponse , generateChatTitle,generateCompareResponse,generateDebateResponse} from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


export async function sendMessage(req,res){
    const {message,chat:chatId, mode= "normal",focus = "web"} = req.body;

    let title= null, chat = null;
     
   if(!chatId){
     title = await generateChatTitle(message)
     chat = await chatModel.create({
        user:req.user.id,
        title
    })}

       const userMessage = await messageModel.create({
        chat:chatId || chat._id,
        content:message,
        role:"user"
    })

    const messages = await messageModel.find({chat:chatId || chat._id})

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
        return res.status(201).json({
            title,
            chat,
            geminiMessage,
            mistralMessage,
            mode: "compare"
        })
     }

     if (mode === "debate"){
        const results = await generateDebateResponse(messages)
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

        return res.status(201).json({
            title,
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
    console.log(messages)

    res.status(201).json({
        title,
        chat,
        aiMessage,
        mode : "normal"
    })
}

export async function getChats(req,res){
    const user  = req.user
    const chats = await chatModel.find({user:user.id})
    res.status(200).json({
        message:"Chats fetched successfully",
        chats
    })
}

export async function getMessages(req,res){
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
}

export async function deleteChat(req,res){
    const {chatId} = req.params
    const chat  = await chatModel.findOneAndDelete({
        _id:chatId,
        user:req.user.id
    })

    await messageModel.deleteMany({chat:chatId})

    if(!chat){
        return res.status(404).json({
            message:"Chat not found",
        })
    }

    res.status(200).json({
        message:"Chat deleted successfully",
    })

}