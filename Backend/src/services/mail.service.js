import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

transporter.verify()
    .then(()=>{console.log("Email transporter is ready to send emails")})
    .catch((err)=>{console.log("Email transporter verification failed:", err)})

    export async function sendEmail({to,subject,html,text}){
        const mailOptions = {
            from: process.env.GOOGLE_USER,
            to,
            subject,
            html,
            text
        
        }

        const details = await transporter.sendMail(mailOptions)
        console.log("Email sent:", details)
    
    }