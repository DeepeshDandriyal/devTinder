const express = require("express");
const { userAuth } = require("../../middleware/auth.js");
const ConnectionRequestModel = require("../models/connectionRequest.js");
const { UserModel } = require("../models/user.js");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:touserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; //user who is logged-in is fromUser
      const toUserId = req.params.touserId;
      const status = req.params.status;

      //allowed status for this api(ignored/interested)
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type");
      }

      //check if the user we are sending are present in db or not
      const toUser = await UserModel.findById(toUserId);

      if (!toUser) {
        throw new Error("User not found");
      }

      //check if there is existing connection request
      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        throw new Error("Connection Request already exists");
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: "Connection Request sent successfully",
        data,
      });
    } catch (err) {
      res.status(400).send("Error " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      //validate the status(accepted/rejected)
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Status not allowed");
      }

      //find the request which we want to review
      const requestId = req.params.requestId;
      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        throw new Error("Connection request not found");
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: "connection request " + status, data });
    } catch (err) {
      res.status(400).send("Error " + err.message);
    }
  }
);

module.exports = requestRouter;
