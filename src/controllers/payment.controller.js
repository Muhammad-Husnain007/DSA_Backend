import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Payment } from "../models/payment.model.js"
import stripe from '../utils/stripe.js'; // Stripe configuration ko import karein

const createPayment = asyncHandler(async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount) {
            throw new ApiError(400, "User ID and amount are required");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            customer: user.stripeCustomerId, // Stripe Customer ID
            payment_method_types: ['card']
        });

        const payment = new Payment({
            userId: user._id,
            amount: amount,
            stripePaymentIntentId: paymentIntent.id,
            status: 'pending'
        });

        await payment.save();

        return res.status(200).json(
            new ApiResponse(200, { clientSecret: paymentIntent.client_secret }, "Payment Intent Created Successfully")
        );
    } catch (error) {
        console.error('Payment Error:', error);
        return res.status(500).json(
            new ApiError(500, error.message || 'Payment failed')
        );
    }
});

export { createPayment };
