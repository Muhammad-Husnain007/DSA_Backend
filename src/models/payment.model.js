// models/payment.model.js
import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true // Amount in cents
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending'
  },
}, {timestamps: true});

export const Payment = mongoose.model('Payment', paymentSchema);

