import express from "express";
import {
  getlogout,
  postUseredit,
  getUseredit,
} from "../controller/userController";
import { avatarUploadMiddleware, reqLOGIN } from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", reqLOGIN, getlogout);
userRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(reqLOGIN)
  .get(getUseredit)
  .post(avatarUploadMiddleware.single("avatar"), postUseredit);

export default userRouter;
