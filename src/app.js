const express = require("express"); //i am referencing that express folder in node_modules

const app = express(); //instance of express js application (creating a new server/app)

app.use("/contact", (req, res) => {
  res.send("hello from the server");
});

app.listen(8000, () => {
  console.log("listening to port 8000");
}); //now my app is ready to listening to outer world request
