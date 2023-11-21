const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("../models/user");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "email is not valid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "password is invalid" });
    }
    if (errors.length > 0) {
      throw new Error("invalid inputs");
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error("User already exist");
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
