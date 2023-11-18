const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRouter = require("./routes/feed");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/feed", feedRouter);

mongoose
  .connect(
    "mongodb+srv://M16:weCcGe8yXb94dJIT@shop-node.w1gikuj.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected!");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
