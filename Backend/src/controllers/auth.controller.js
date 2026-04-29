import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"


export async function register(req, res) {
  try{
    const { username, email, password } = req.body

    const isUserExist = await userModel.findOne(
        { $or: [{ username }, { email }] }
    )
    if (isUserExist) {
        return res.status(400).json({
            message: "user already exist with this email",
            success: false,
            err: "user already exists"
        })
    }

    const user = await userModel.create({ username, email, password, verified: true })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });

  }catch (err) {
        console.error("Register error:", err)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export async function login(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Password does not match"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function getMe(req, res) {
    const userId = req.user.id
    const user = await userModel.findById(userId).select("-password")
    if (!user) {
        return res.status(400).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}

export async function googleCallback(req, res) {
    try {
        const user = req.user

        const token = jwt.sign({
            id: user._id,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: "1d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        res.redirect(`${process.env.FRONTEND_URL}`)

    } catch(err) {
        res.redirect(`${process.env.FRONTEND_URL}/login`)
    }
}

export async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true
    })

    res.status(200).json({
        message: "User logged out successfully",
        success: true
    })
}