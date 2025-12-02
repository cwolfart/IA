import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
});

export const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn("Stripe Secret Key is missing. Using mock mode.");
        return null;
    }
    return stripe;
};
