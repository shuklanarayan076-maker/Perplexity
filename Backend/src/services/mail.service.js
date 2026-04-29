import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html, text }) {
    const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
        text
    })

    if (error) {
        console.log("Error sending email:", error)
        throw error
    }

    console.log("Email sent:", data)
}