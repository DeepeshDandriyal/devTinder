const jwt = require("jsonwebtoken");
const { UserModel } = require("../src/models/user.js");

const userAuth = async (req, res, next) => {
  try {
    //Read the token from the request cookies
    const { token } = req.cookies;
    if (!token) {
      // throw new Error("TOken is not valid");
      //handle this here
      return res.status(401).send("please login");
      //in frontend now check status if error is coming due to user not login
    }
    //validate the token
    const decodedObj = await jwt.verify(token, "Browni@20");
    //find the user
    const { _id } = decodedObj;

    const user = await UserModel.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
};

module.exports = { userAuth };
