const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const { UserModel } = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

const validator = require("validator");

//signup api
authRouter.post("/signup", async (req, res) => {
  // step1. validation of data

  validateSignUpData(req);

  //step2. Encrypt the password
  const { password, firstName, lastName, emailId } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  //to add this user in our User Collection create a new instance of UserModel and then add that instance to our database
  const user = new UserModel({
    firstName,
    lastName,
    emailId,
    password: passwordHash,
  }); //created instance of UserModel by passing data

  //when we are signing user let it login also

  //this instance of UserModel have save() method to save data to our database this returns promise(most mongoose functions return promise)
  try {
    const savedUser = await user.save();
    const token = await user.getJwt();

    //add the token to cookie and send the response back to the user
    res.cookie("token", token);
    res.json(savedUser);
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
});

//login api
authRouter.post("/login", async (req, res) => {
  try {
    //validate emailId and password
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid");
    }

    const user = await UserModel.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      //create a jwt token
      const token = await user.getJwt();

      //add the token to cookie and send the response back to the user
      res.cookie("token", token);

      res.status(200).json(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//logout api
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("User logged out");
});

module.exports = authRouter;
