import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedInuser = req.session.user || {};
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  next();
};

export const reqLOGIN = (req, res, next) => {
  if (!res.locals.loggedIn) {
    console.log("로그인필요");
    return res.redirect("/");
  }
  next();
};

export const noreqLOGIN = (req, res, next) => {
  if (res.locals.loggedIn) {
    console.log("로그인 불필요");
    return res.redirect("/");
  }
  next();
};

export const avatarUploadMiddleware = multer({
  dest: "uploads/avatar",
  limits: { fileSize: 1500000 },
});
