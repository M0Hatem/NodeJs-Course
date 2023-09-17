const Sequelize = require("sequelize");

const sequelize = require("../util/database");
const { STRING } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: Sequelize.STRING,
  name: Sequelize.STRING,
});

module.exports = User;
