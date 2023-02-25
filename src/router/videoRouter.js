import express from "express";
import { noreqLOGIN, reqLOGIN, videoUploadMiddleware } from "../middleware";
import {
  getUpload,
  postUpload,
  getVideoEdit,
  postVideoEdit,
  watch,
  deleteVideo,
} from "../controller/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.all(reqLOGIN).get("/:id([0-9a-f]{24})/delete", deleteVideo);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(reqLOGIN)
  .get(getVideoEdit)
  .post(postVideoEdit);
videoRouter
  .route("/upload")
  .all(reqLOGIN)
  .get(getUpload)
  .post(
    videoUploadMiddleware.fields([
      { name: "videoFile" },
      { name: "thumbFile" },
    ]),
    postUpload
  );

export default videoRouter;
