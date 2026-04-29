import {io} from "socket.io-client";

export const initializeSocketConnection = () =>{
    const socket = io('https://perplexity-o8nk.onrender.com',{
        withCredentials:true
    });

    socket.on("connect",()=>{
        console.log("Connected to socket.io server")
    })
    
}