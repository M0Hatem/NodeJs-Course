const path = require('path');

const express = require('express');

const app = express();

app.use('/', (req, res, next) => {
  res.send('hello');
});

app.listen(3000);
