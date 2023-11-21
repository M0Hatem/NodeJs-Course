const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    // jwt.verify = decode and verify
    decodedToken = jwt.verify(token, "superSecretKey");
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  console.log(decodedToken);
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
