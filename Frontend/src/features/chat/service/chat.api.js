import axios from "axios"


const api = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
}) 

export const sendMessage = async ({message,chatId,mode = 'normal',focus = 'web'}) =>{
    const response = await api.post("/api/chats/message",{message, chat:chatId,mode,focus})
    return response.data

}

export const getChats = async () =>{
    const response = await api.get("/api/chats")
    return response.data

}

export const getMessages = async (chatId) =>{
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data

}

export const deleteChat = async (chatId) =>{
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data

}

export const logout = async () =>{
    const response = await api.post("/api/auth/logout")
    return response.data

}