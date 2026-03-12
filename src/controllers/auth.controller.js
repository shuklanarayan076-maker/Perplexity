import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js"


export async function register(req,res){
    const {username,email,password} = req.body
    const isUserExist = await userModel.findOne(
        {$or:[{username},{email}]}
    )
    if(isUserExist){
        return res.status(400).json({message:"user already exist with this email",
            success:false,
            err:"user already exists"
        })
    
    }

    const user = await userModel.create({username,email,password})

      await sendEmail({
        to: email,
        subject: "Welcome to Perplexity!",
        html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                <p>Best regards,<br>The Perplexity Team</p>
        `
    })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });


   
}