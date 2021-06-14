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

module.exports = router;
