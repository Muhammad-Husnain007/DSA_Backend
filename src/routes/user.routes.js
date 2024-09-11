import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser, registerUser, logoutUser, getUsersData, getUserDataById } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profile",
            maxCount: 1,
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/").get(getUsersData);
router.route("/:userId").get(getUserDataById);
router.route("/logout").post(verifyJwt, logoutUser)



export default router;