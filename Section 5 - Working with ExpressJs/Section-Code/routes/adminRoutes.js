const express = require('express');

const router = express.Router();

router.get('/add-product', (req, res, next) => {
  res.send(`
    <html>
      <form action="/admin/add-product" method="POST">
        <input type="text" name="Title"></input>
        <button type="submit">ADD Product</button>
      </form>
    </html>
  `);
});

router.post('/add-product', (req, res) => {
  console.log(req.body);
  res.redirect('/');
});

module.exports = router;
