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
    return res.render("userEdit", { pageTitle: "User Edit", ERRMSG });
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
    scope: "read:user user:email",
    allow_signup: false,
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
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "post",
      headers: { Accept: " application/json" },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com/user";
    const userRequest = await (
      await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).json();
    const emailRequest = await (
      await fetch(`${apiUrl}/emails`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).json();
    const verifiEmail = emailRequest.find(
      (email) => email.primary === true && email.verified === true
    );
    let user = await User.findOne({ email: verifiEmail.email });
    if (!user) {
      user = await User.create({
        email: verifiEmail.email,
        name: userRequest.name,
        location: userRequest.location,
        username: userRequest.login,
        socialOnly: true,
        avatarUrl: userRequest.avatar_url,
      });
    }
    req.session.user = user;
    req.session.loggedIn = true;
  } else {
    // 엑세스토큰 없을시
    const ERRMSG = "엑세스 토큰이 없습니다.";
    return res.render("login", { pageTitle: "Login", ERRMSG });
  }

  res.redirect("/");
};

export const kakaoStart = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const redirectUri = "http://localhost:4000/user/kakaoEnd";
  const config = {
    client_id: process.env.KAKAO_REST_API,
    redirect_uri: redirectUri,
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const kakaoEnd = async (req, res) => {
  const { code } = req.query;
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const redirectUri = "http://localhost:4000/user/kakaoEnd";
  const config = {
    client_id: process.env.KAKAO_REST_API,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "post",
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com/v2/user/me";
    const userRequest = await (
      await fetch(apiUrl, {
        method: "post",
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).json();
    let user = await User.findOne({ email: userRequest.kakao_account.email });
    if (!user) {
      user = await User.create({
        username: userRequest.id,
        email: userRequest.kakao_account.email,
        avatarUrl: userRequest.properties.profile_image,
        socialOnly: true,
        name: userRequest.properties.nickname,
      });
    }
    req.session.user = user;
    req.session.loggedIn = true;
  } else {
    // 엑세스토큰 없을시
    const ERRMSG = "엑세스 토큰이 없습니다.";
    return res.render("login", { pageTitle: "Login", ERRMSG });
  }
  return res.redirect("/");
};
