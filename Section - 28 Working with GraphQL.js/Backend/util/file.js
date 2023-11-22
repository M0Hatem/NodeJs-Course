const path = require("path");
const fs = require("fs");

const clearImage = (filepath) => {
  filepath = path.join(__dirname, "..", filepath);
  fs.unlink(filepath, (err) => console.log(err));
};

exports.clearImage = clearImage;
