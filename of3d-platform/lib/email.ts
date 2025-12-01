import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log("⚠️ RESEND_API_KEY not found. Email simulation:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        return { success: true, simulated: true };
    }

    try {
        const data = await resend.emails.send({
            from: 'OF3D Platform <onboarding@resend.dev>',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}
