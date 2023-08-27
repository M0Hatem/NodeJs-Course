const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const getData = function (cb) {
  const p = path.join(rootDir, 'data', 'products.json');
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    }
    cb(JSON.parse(fileContent));
  });
  let products = [];
};

module.exports = class Product {
  constructor(t) {
    this.title = t;
  }
  save() {
    getData((data) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        // console.log(err);
      });
    });
    const p = path.join(rootDir, 'data', 'products.json');
    fs.readFile(p, (err, fileContent) => {});
  }
  static fetchAll(cb) {
    getData(cb);
  }
};
