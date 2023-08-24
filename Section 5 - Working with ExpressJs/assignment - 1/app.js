const express = require('express');

const app = express();

app.use('/user', (req, res, next) => {
  res.send('<h1>lorem</h1>');
});
app.use('/', (req, res, next) => {
  res.send('<h1>hello Mate o-O</h1>');
});

app.listen(3000);
