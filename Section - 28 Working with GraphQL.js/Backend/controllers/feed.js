const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currPage = +req.query.page || 1;
  const perPage = 2;
  try {
    let totalItems = await Post.find().countDocuments();
    let posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 }) // descending sort by creation date
      .skip((currPage - 1) * perPage)
      .limit(perPage);

    res
      .status(200)
      .json({ message: 'fetched posts', posts: posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('post validation failed');
    err.statusCode = 422;
    throw err;
  }
  console.log(req.body);
  if (!req.file) {
    const err = new Error('No Image Provided');
    err.statusCode = 422;
    throw err;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace('\\', '/');
  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    // emit -> send res to all users, broadcast() -> all users except this one
    // Channel or event -> posts
    // data we want to send -we define it- ->  action: create, post -> new post
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: 'Post Created Successfully!',
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  try {
    if (!post) {
      const err = new Error('post not found');
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ message: 'Post Fetched', post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('post validation failed');
    err.statusCode = 422;
    throw err;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }

  if (!imageUrl) {
    const err = new Error('No Image Provided');
    err.statusCode = 422;
    throw err;
  }
  const post = await Post.findById(postId).populate('creator');

  try {
    if (!post) {
      const err = new Error('post not found');
      err.statusCode = 404;
      throw err;
    }

    if (post.creator._id.toString() !== req.userId) {
      const err = new Error('Not Authorized');
      err.statusCode = 403;
      throw err;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    io.getIO().emit('posts', { action: 'update', post: result });
    res.status(200).json({ message: 'Post Updated', post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  try {
    if (!post) {
      const err = new Error('post not found');
      err.statusCode = 404;
      throw err;
    }

    if (post.creator.toString() !== req.userId) {
      const err = new Error('Not Authorized');
      err.statusCode = 403;
      throw err;
    }
    // Check logged in user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Deleted Post' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
const clearImage = (filepath) => {
  filepath = path.join(__dirname, '..', filepath);
  fs.unlink(filepath, (err) => console.log(err));
};
