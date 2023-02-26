import express from "express";
import {
  getlogout,
  postUseredit,
  getUseredit,
  getUserView,
  getchangePW,
  postchangePW,
  githubStart,
  githubEnd,
  kakaoStart,
  kakaoEnd,
} from "../controller/userController";
import { avatarUploadMiddleware, noreqLOGIN, reqLOGIN } from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", reqLOGIN, getlogout);
userRouter.route("/:id([0-9a-f]{24})").get(getUserView);
userRouter.route("/changepw").all(reqLOGIN).get(getchangePW).post(postchangePW);
userRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(reqLOGIN)
  .get(getUseredit)
  .post(avatarUploadMiddleware.single("avatar"), postUseredit);
userRouter.all(noreqLOGIN).get("/githubStart", githubStart);
userRouter.get("/githubEnd", githubEnd);
userRouter.all(noreqLOGIN).get("/kakaoStart", kakaoStart);
userRouter.get("/kakaoEnd", kakaoEnd);
export default userRouter;
