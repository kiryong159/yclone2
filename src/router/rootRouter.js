import express from "express";
import { getHome } from "../controller/videoController";
import {
  getLogin,
  getJoin,
  postLogin,
  postJoin,
} from "../controller/userController";
import { noreqLOGIN } from "../middleware";
const rootRouter = express.Router();

rootRouter.get("/", getHome);
rootRouter.route("/login").all(noreqLOGIN).get(getLogin).post(postLogin);
rootRouter.route("/join").all(noreqLOGIN).get(getJoin).post(postJoin);

export default rootRouter;
