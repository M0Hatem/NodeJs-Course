const path = require('path');
const { createServer } = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const feedAuth = require('./routes/auth');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// connection
const app = express();
const httpServer = createServer(app);
const io = require('./socket').init(httpServer);

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', feedAuth);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data });
});
mongoose
  .connect(
      "mongodb+srv://M16:weCcGe8yXb94dJIT@shop-node.w1gikuj.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((result) => {
    // const server = app.listen(8080);
    // // socket connection on top of HTTP Server
    // const io = require('./socket').init(server);
    // io.on('connection', (socket) => {
    //   console.log('client connected');
    // });

    io.on('connection', (socket) => {
      console.log('client connected');
    });
    httpServer.listen(8080);
  })
  .catch((err) => console.log(err));
