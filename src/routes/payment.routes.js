import express from 'express';
import { createPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-payment', createPayment);

export default router;
