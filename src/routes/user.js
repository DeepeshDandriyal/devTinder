const express = require("express");
const { userAuth } = require("../../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const { UserModel } = require("../models/user");
const userRouter = express.Router();

//get all the pending connection requests for the logged in user(interested)
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "age",
      "gender",
      "about",
    ]);

    res.json(connectionRequests);
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

//get connections
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "age",
        "gender",
        "about",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "photoUrl",
        "age",
        "gender",
        "about",
      ]);

    const datas = connections.map((data) => {
      if (loggedInUser._id.equals(data.fromUserId._id)) {
        return data.toUserId;
      } else {
        return data.fromUserId;
      }
    });

    res.json(datas);
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

//feed api
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //user should see all the user cards except
    //0. His own card
    //1. His connections
    //2. ignored people
    //3. already sent connection request to

    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    //find all connection req sent/recived
    const connectionRequest = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });
    const users = await UserModel.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select(["firstName", "lastName", "photoUrl", "about", "gender", "age"])
      .skip(limit * (page - 1))
      .limit(limit);

    res.json(users);
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

module.exports = userRouter;
