import express from "express";
import { getlogout } from "../controller/userController";

const userRouter = express.Router();

userRouter.get("/logout", getlogout);

export default userRouter;
