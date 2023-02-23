import User from "../models/User";
import bcrypt from "bcrypt";

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    const ERRMSG = "없는 아이디";
    return res.status(400).render("login", { pageTitle: "login", ERRMSG });
  }
  const comparePW = await bcrypt.compare(password, user.password);
  if (!comparePW) {
    const ERRMSG = "비밀번호가 틀림";
    return res.status(400).render("login", { pageTitle: "login", ERRMSG });
  }
  req.session.user = user;
  req.session.loggedIn = true;
  return res.redirect("/");
};

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { username, email, password, password2, name, location } = req.body;
  const check = await User.exists({ $or: [{ username }, { email }] });
  if (check) {
    console.log("중복된 아이디 혹은 이메일 입니다.");
    return res.status(400).redirect("/join");
  }
  if (password !== password2) {
    console.log("비밀번호와 비밀번호 확인이 다릅니다.");
    return res.status(400).redirect("/join");
  }
  try {
    await User.create({
      username,
      email,
      password,
      name,
      location,
    });
    return res.status(200).redirect("/");
  } catch {
    return res.status(400).render("join");
  }
};

export const getlogout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
