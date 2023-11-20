const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });

    const result = await user.save();

    res.status(201).json({ message: 'User Created', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('A user with that email could not be found.');
      // NOT AUTH
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(pw, user.password);

    if (!isEqual) {
      const error = new Error('Wrong password!');
      // NOT AUTH
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      'somesupersecret,toolongstring',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found');
      // NOT AUTH
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      // NOT AUTH
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ messauge: 'Status Updated' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
