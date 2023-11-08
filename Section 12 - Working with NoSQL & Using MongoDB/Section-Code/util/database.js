const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const url =
  "mongodb+srv://M16:weCcGe8yXb94dJIT@shop-node.w1gikuj.mongodb.net/?retryWrites=true&w=majority";
const mongoConnect = (callback) => {
  MongoClient.connect(url)
    .then((client) => {
      console.log("Connected!");
      _db = client.db("shop");
      callback();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
