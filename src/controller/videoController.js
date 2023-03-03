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
      hashtag: Video.FormatHashtag(hashtag),
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
  if (String(req.session.user._id) !== String(video.owner)) {
    console.log(
      `로그인 중인 아이디${String(req.session.user._id)}`,
      `비디오 주인${String(video.owner)}`
    );
    return res.status(403).redirect("/");
  }
  return res.render("videoEdit", { pageTitle: "Video Edit", video });
};

export const postVideoEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtag } = req.body;
  const video = await Video.findById(id);
  if (String(req.session.user._id) !== String(video.owner)) {
    console.log(
      `로그인 중인 아이디${String(req.session.user._id)}`,
      `비디오 주인${String(video.owner)}`
    );
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(
    id,
    {
      title,
      description,
      hashtag: Video.FormatHashtag(hashtag),
    },
    { new: true }
  );
  return res.redirect("/");
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  return res.render("watch", { pageTitle: "Watch Video", video });
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: new RegExp(keyword, "i") },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  const user = await User.findById(video.owner);
  if (String(video.owner) !== String(req.session.user._id)) {
    console.log(video.owner);
    console.log(req.session.user._id);
    console.log("비디오 주인이 아님");
    return res.redirect("/");
  }
  for (var i = 0; i < user.videos.length; i++) {
    if (String(user.videos[i]) === String(id)) {
      user.videos.splice(i, 1);
    } else {
      console.log("false");
    }
  }
  await user.save();
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const Createcomment = (req, res) => {};
