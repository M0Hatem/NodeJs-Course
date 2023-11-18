const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRouter = require("./routes/feed");

const app = express();

app.use(bodyParser.json());
app.use("images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/feed", feedRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

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
