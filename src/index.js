import "dotenv/config";
import "./db.js";
import "./models/User";
import { localsMiddleware } from "./middleware";

import express from "express";

import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";

import userRouter from "./router/userRouter";
import rootRouter from "./router/rootRouter";
import videoRouter from "./router/videoRouter";

const PORT = 4000;
const app = express();

app.use(morgan("dev"));
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MongoUrl }),
  })
);
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/user", userRouter);
app.use("/", rootRouter);
app.use("/video", videoRouter);

const listenport = () => {
  console.log(`✅ 주소는 http://localhost:${PORT}`);
};
app.listen(PORT, listenport);
