const { Router } = require("express");
const User = require("../models/User");

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name, surname } = req.body;

  const candidate = await User.findOne({ email: email });
  if (candidate)
    return res.json({ err: true, msg: "User is already exist. Please login" });

  const user = new User({
    name: name,
    surname: surname,
    email: email,
    password: password,
    score: 0,
  });

  await user.save();

  res.json({ err: false, msg: "User was created" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    if (user.password === password) return res.json({ ...user, err: false });
    else {
      return res.json({
        err: true,
        msg: "Password is wrong",
      });
    }
  } else {
    return res.json({
      err: true,
      msg: "User is not found. Maybe data is wrong",
    });
  }
});

router.post("/score", async (req, res) => {
  const { _id } = req.body;
  const user = await User.findById(_id);

  user.score += 10;

  await user.save();

  return res.json({
    err: false,
    user: user,
  });
});

router.post("/allUsers", async (req, res) => {
  const { q } = req.body;
  const allUsers = await User.find();

  console.log(allUsers);

  const filteredData = allUsers
    .sort((e1, e2) => e2.score - e1.score)
    .slice(0, q);

  return res.json({
    err: false,
    users: filteredData,
  });
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "studiomanagerhelper@gmail.com",
    pass: "1999password1999",
  },
});

router.post("/feedback", async (req, res) => {
  const { email, name, text, priority } = req.body;

  const mailOptions = {
    from: "studiomanagerhelper@gmail.com",
    to: email,
    subject: "Studio support reply :)",
    html: `
            <p>Dear ${name}, we glad u to ask us about solution of ur problem.</p>
            <p>We will do our best for you</p>
            <p>Ur request below :</p>
            <p>${text}</p>
            <p>Priority:${priority ? priority : 10}</p>
            <img src = "https://png.pngtree.com/thumb_back/fw800/background/20201012/pngtree-abstract-particle-equalizer-visualization-music-background-image_410675.jpg">
          `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    err && console.log(err);
    res.json({
      err: false,
      msg: "Check your email",
    });
  });
});

router.post("/password", async (req, res) => {
  const { _id, password } = req.body;
  const user = await User.findById(_id);
  user.password = password;
  await user.save();

  return res.json({
    err: false,
    msg: "Password was changed",
  });
});

module.exports = router;
