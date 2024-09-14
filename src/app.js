                               // Define Middleware

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();

app.use(cors({ // allow to permission access resource on other domain
    origion: process.env.CORS_ORIGION,
    credentials: true  // allow to sent cookies, authorization, heders
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.static("public")); // handle statics file i.e css, images, js
app.use(cookieParser()); // for cookies parse means cookies easily read and accessible

         // Import Routes of all Controllers 

import userRouter from './routes/user.routes.js'
import paymentRouter from './routes/payment.routes.js'

app.use("/api/v1/user", userRouter)
app.use("/api/v1/payment", paymentRouter)


export { app }