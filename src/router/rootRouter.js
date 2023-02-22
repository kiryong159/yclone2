import express from "express";
import { getHome } from "../controller/videoController";
import {
  getLogin,
  getJoin,
  postLogin,
  postJoin,
} from "../controller/userController";
const rootRouter = express.Router();

rootRouter.get("/", getHome);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.route("/join").get(getJoin).post(postJoin);

export default rootRouter;
