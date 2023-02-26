import User from "../models/User";
import fetch from "node-fetch";
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

export const getUseredit = (req, res) => {
  return res.render("userEdit", { pageTitle: "User Edit" });
};

export const postUseredit = async (req, res) => {
  const {
    params: { id },
    body: { email, name, location },
  } = req;
  const { file } = req;

  const avatarUrl = req.session.user.avatarUrl;
  const emailCheck = await User.exists({ email });
  if (req.session.user.email !== email) {
    if (emailCheck) {
      const ERRMSG = "사용중인 이메일 입니다";
      return res.render("userEdit", { pageTitle: "User Edit", ERRMSG });
    }
  }

  const updateUser = await User.findByIdAndUpdate(
    id,
    {
      email,
      name,
      location,
      avatarUrl: file ? file.path : avatarUrl,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.render("home", { pageTitle: "Home" });
};

export const getUserView = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    const ERRMSG = "없는 유저 입니다.";
    return res.render("home", { pageTitle: "Home", ERRMSG });
  }
  return res.render("userView", { pageTitle: "User-View", user });
};

export const getchangePW = (req, res) => {
  if (req.session.user.socialOnly === true) {
    const ERRMSG = "소셜 로그인 유저는 비밀번호가 없습니다.";
    return res.render("login", { pageTitle: "Login", ERRMSG });
  }
  return res.render("changePW", { pageTitle: "changePW" });
};
export const postchangePW = async (req, res) => {
  const id = req.session.user._id;
  const { oldpassword, newpassword, newpassword2 } = req.body;
  const user = await User.findById(id);
  if (!user) {
    const ERRMSG = "없는 유저 입니다.";
    return res
      .status(400)
      .render("changePW", { pageTitle: "changePW", ERRMSG });
  }
  const checkPW = await bcrypt.compare(oldpassword, user.password);
  if (!checkPW) {
    const ERRMSG = "oldpassword가 틀렸습니다.";
    return res
      .status(400)
      .render("changePW", { pageTitle: "changePW", ERRMSG });
  }
  if (newpassword !== newpassword2) {
    const ERRMSG = "비밀번호/비밀번호 확인이 다릅니다.";
    return res
      .status(400)
      .render("changePW", { pageTitle: "changePW", ERRMSG });
  }
  user.password = newpassword;
  await user.save();
  return res.status(200).redirect("/");
};

export const githubStart = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GIT_CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const githubEnd = async (req, res) => {
  const { code } = req.query;
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GIT_CLIENT_ID,
    client_secret: process.env.GIT_SECRET,
    code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const data = await (
    await fetch(finalUrl, {
      method: "post",
      headers: { Accept: "application/json" },
    })
  ).json();
  console.log("데이타", data);
  if ("access_token" in data) {
    const { access_token } = data;
    const apiUrl = "https://api.github.com/user";
    const userRequest = await (
      await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    console.log("유저", userRequest);
    const emailRequest = await (
      await fetch(`${apiUrl}/emails`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).json();
    const verifiedEmail = emailRequest.find(
      (email) => email.primary === true && email.verified === true
    );
    console.log("이메일", verifiedEmail.email);

    let emailCheck = await User.findOne({ email: verifiedEmail.email });
    if (!emailCheck) {
      emailCheck = await User.create({
        username: userRequest.login,
        avatarUrl: userRequest.avatar_url,
        email: verifiedEmail.email,
        name: userRequest.name,
        socialOnly: true,
        location: userRequest.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = emailCheck;
    return res.redirect("/");
  }
};
