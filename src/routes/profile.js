const express = require("express");
const { userAuth } = require("../../middleware/auth.js");
const { validateEditProfileData } = require("../utils/validation.js");
const validator = require("validator");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const loggedInUser = req.user; //userAuth middleware se mileaga ye hame

    //edit the detail of loggedInUser
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json(loggedInUser);
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please Enter a strong password");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();
    res.send("Password Changed");
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

module.exports = profileRouter;
