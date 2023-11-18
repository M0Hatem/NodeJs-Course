const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "this is the first post!",
        imageUrl: "images/nigaCat.jpeg",
        creator: {
          name: "M16",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.creatPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "validation failed ,entered data is not correct",
      errors: errors.array(),
    });
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck",
    creator: {
      name: "M16",
    },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "post created successfully",
        post: result,
      });
    })
    .catch((err) => console.log(err));
};
