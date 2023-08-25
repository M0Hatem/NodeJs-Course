const path = require('path');

const router = require('express').Router();

router.get('/user', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'user.html'));
});

module.exports = router;
