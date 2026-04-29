import {Server} from "socket.io"


let io;
export function initSocket(httpServer){
    io = new Server(httpServer, {
        cors:{
            origin: "https://perplexity-o8nk.onrender.com",
            credentials:true
        }
    }
        )

        console.log("socket.io server is Running")

        io.on("connection", (socket)=>{
            console.log("A user connected: " + socket.id)
        })

       
}

 export function getIO(){
            if(!io){
                throw new Error("Socket.io not initialized")
            }
            return io;
        }