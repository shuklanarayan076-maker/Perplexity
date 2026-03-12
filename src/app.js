import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.get("/", (req,res)=>{
    res.json({message:"welcome to page"})
})

app.use("/api/auth",authRouter)

export default app