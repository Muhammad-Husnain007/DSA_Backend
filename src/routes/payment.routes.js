import { Router } from "express";
import { createPayment } from "../controllers/payment.controller";
const router = Router()

router.route("/handle-payment").post(createPayment);

export default router;

