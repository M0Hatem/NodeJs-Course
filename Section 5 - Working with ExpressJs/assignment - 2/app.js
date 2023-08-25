const path = require('path');

const express = require('express');

const mainRout = require('./routes/main');
const userRout = require('./routes/userRoutes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(userRout);
app.use(mainRout);

app.listen(3000);
