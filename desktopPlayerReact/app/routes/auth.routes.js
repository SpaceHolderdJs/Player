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

module.exports = router;
