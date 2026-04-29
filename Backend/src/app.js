import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"
import chatRouter from "./routes/chat.route.js"
import morgan from "morgan"
import passport from "./config/passport.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))
app.use(passport.initialize())




app.use("/api/auth",authRouter)
app.use("/api/chats",chatRouter)



app.use(express.static(path.join(__dirname, "../dist")))


app.get("/:path*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"))
})



// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        success: false
    });
});

export default app