import  "dotenv/config"
import app from "./src/app.js"
import connectDB from "./src/config/database.js"
import { testAI } from "./src/services/ai.service.js"

testAI()

connectDB()

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})