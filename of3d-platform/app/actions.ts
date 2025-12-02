"use server";

import { sendEmail } from "@/lib/email";
import { getUser } from "@/lib/db/users";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function sendNotificationEmail(userId: string, title: string, message: string, link?: string) {
    try {
        const user = await getUser(userId);
        if (!user || !user.email) {
            console.error("User not found or no email:", userId);
            return;
        }

        const html = `
            <div style="font-family: sans-serif; color: #333;">
                <h1>${title}</h1>
                <p>${message}</p>
                ${link ? `<a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${link}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
                <p style="font-size: 12px; color: #666; margin-top: 20px;">OF3D Platform Notification</p>
            </div>
        `;

        await sendEmail(user.email, title, html);
    } catch (error) {
        console.error("Error in sendNotificationEmail action:", error);
    }
}

export async function createCheckoutSession(invoiceId: string, amount: number, title: string) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe is not configured");
        }

        const headersList = await headers();
        const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: title,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/finances?success=true&invoiceId=${invoiceId}`,
            cancel_url: `${origin}/finances?canceled=true`,
            metadata: {
                invoiceId,
            },
        });

        return { url: session.url };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return { error: "Failed to create checkout session" };
    }
}
