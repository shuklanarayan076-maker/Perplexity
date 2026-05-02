import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "ai", "gemini", "mistral", "pro", "con","research"],
            required: true
        },
        focus: {
            type: String,
            default: "web"
        }
    },
    { timestamps: true }
)

const messageModel = mongoose.model("Message", messageSchema)
export default messageModel;