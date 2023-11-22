const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const { clearImage } = require("../util/file");

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
      const error = new Error("invalid inputs");
      error.data = errors;
      error.code = 422;
      throw error;
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
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("user not found");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("in correct password");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "superSecretKey",
      { expiresIn: "1h" }
    );
    return {
      token: token,
      userId: user._id.toString(),
    };
  },
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "title is invalid" });
    }
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "title is invalid" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "content is invalid" });
    }
    if (errors.length > 0) {
      const error = new Error("invalid inputs");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("invalid user ");
      error.code = 401;
      throw error;
    }

    const post = new Post({
      title: postInput.title,
      imageUrl: postInput.imageUrl,
      content: postInput.content,
      creator: user,
    });
    const createdPost = await post.save();

    user.posts.push(createdPost);

    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;

    const totalPosts = await Post.find().count();
    const posts = await Post.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("creator");
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },
  post: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("no post found");
      error.code = 404;
      throw error;
    }
    return {
      ...post._doc,
      id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const error = new Error("no post found");
      error.code = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.code = 403;
      throw error;
    }
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "title is invalid" });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "content is invalid" });
    }
    if (errors.length > 0) {
      const error = new Error("invalid inputs");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("no post found");
      error.code = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.code = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findOneAndDelete(id);
    const user = User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },
  user: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const user = User.findById(req.userId);
    if (!user) {
      const error = new Error("User Not Found.");
      error.code = 404;
      throw error;
    }
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not Authenticated");
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User Not Found.");
      error.code = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
};
