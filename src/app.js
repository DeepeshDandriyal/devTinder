const express = require("express");
const { connectDB } = require("./config/database");
const cors = require("cors");
const app = express();

const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/requests.js");
const userRouter = require("./routes/user.js");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("database connected successfully");
    app.listen(8000, () => {
      console.log("listening to port 8000");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected");
  });
