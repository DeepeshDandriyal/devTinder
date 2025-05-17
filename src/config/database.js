const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://deepeshdandriyal1:devtinder@cluster0.ketzpph.mongodb.net/devTinder"
  );
  //add devTinder at the end it will create devTinder database in our cluster
};

module.exports = { connectDB };
