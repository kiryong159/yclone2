import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hashtag: [{ type: String }],
  createdAt: { type: Date, required: true },
  meta: {
    view: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  fileUrl: { type: String },
  thumbUrl: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

videoSchema.static("FormatHashtag", function (banana) {
  return banana
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
