import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Payment } from "../models/payment.model.js"
import stripe from '../utils/stripe.js'; // Stripe configuration ko import karein

const createPayment = asyncHandler(async (req, res) => {
    try {
      const { amount, currency, userId } = req.body;
      const findUser = await User.findById(userId);
      
      if (!findUser) {
         throw new ApiError(400, "User not found");
      }

      const customer = await stripe.customers.create();
      const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer.id},
        {apiVersion: '2024-06-20'}
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
 
      await Payment.create({
        amount,
        currency,
        userId,
        stripePaymentIntentId: paymentIntent.client_secret,
      });
    
      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: 'pk_test_51Pyorb06YJZjlwg0XycprfIoOOObTV3QeXNz90sx9ft08Qc19PmNtCrFVheN5iRjILFqDazGGtbBtl5GikCOBgZn00C8C7IOuO'
      });
    
    } catch (error) {
      throw new ApiError(500, error?.message, "Something went wrong");
    }
 });
 
 

export { createPayment };
