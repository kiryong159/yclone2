import User from "../models/User";
import Video from "../models/Video";

export const getHome = async (req, res) => {
  const videos = await Video.find({}).populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtag } = req.body;
  const video = req.files.videoFile;
  const thumb = req.files.thumbFile;
  const TIMEDIFF = 9 * 60 * 60 * 1000;
  try {
    const uploadVideo = await Video.create({
      title,
      description,
      createdAt: Date.now() + TIMEDIFF,
      hashtag: hashtag
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`)),
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: req.session.user._id,
    });
    const user = await User.findById(req.session.user._id);
    user.videos.push(uploadVideo._id);
    user.save();
    return redirect("/");
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
};

export const getVideoEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  return res.render("videoEdit", { pageTitle: "Video Edit", video });
};

export const postVideoEdit = (req, res) => {
  return res.redirect("/");
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  return res.render("watch", { pageTitle: "Watch Video", video });
};
