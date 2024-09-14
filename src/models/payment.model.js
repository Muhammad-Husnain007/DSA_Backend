import mongoose, {Schema} from 'mongoose';

const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
 stripePaymentIntentId: {
  type: String,
  required: true,
  unique: true
}

}, {timestamps: true});

export const Payment = mongoose.model('Payment', paymentSchema);
