import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import userModel from "../models/user.model.js"

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check karo user already exist karta hai kya
        let user = await userModel.findOne({ googleId: profile.id })

        if(user) return done(null, user)

        // Email se bhi check karo
        user = await userModel.findOne({ email: profile.emails[0].value })

        if(user){
            // Existing user ko Google se link karo
            user.googleId = profile.id
            user.verified = true
            await user.save()
            return done(null, user)
        }

        // Naya user banao
        user = await userModel.create({
            username: profile.displayName.replace(/\s/g, '').toLowerCase() + Math.random().toString(36).slice(2, 6),
            email: profile.emails[0].value,
            googleId: profile.id,
            verified: true,
            password: null
        })

        return done(null, user)

    } catch(err) {
        return done(err, null)
    }
}))

export default passport