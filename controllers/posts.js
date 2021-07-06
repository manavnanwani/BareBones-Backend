import PostMessage from "../models/postMessage.js";
import subReddit from "../models/sub.js";
import mongoose from "mongoose";

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostMessage.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await PostMessage.countDocuments({});

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");

    const posts = await PostMessage.find({
      $or: [{ title }],
    });

    res.json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    const sub = await subReddit.findOne({ title: post.subReddit });
    sub.posts.push(newPost._id);
    const updatedPost = await subReddit.findByIdAndUpdate(sub._id, sub, {
      new: true,
    });
  } catch (error) {
    console.log(error);
  }
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that ID");

  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    {
      new: true,
    }
  );

  res.json(updatedPost);
};

export const upvotePost = async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that ID");

  const post = await PostMessage.findById(_id);

  const index1 = post.upvotes.findIndex((id) => id === String(req.userId));
  const index2 = post.downvotes.findIndex((id) => id === String(req.userId));

  if (index1 === -1) {
    post.upvotes.push(req.userId);
    if (index2 !== -1)
      post.downvotes = post.downvotes.filter((id) => id !== String(req.userId));
  } else {
    post.upvotes = post.upvotes.filter((id) => id !== String(req.userId));
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatedPost);
};

export const downvote = async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that ID");

  const post = await PostMessage.findById(_id);

  const index1 = post.upvotes.findIndex((id) => id === String(req.userId));
  const index2 = post.downvotes.findIndex((id) => id === String(req.userId));

  if (index2 === -1) {
    post.downvotes.push(req.userId);
    if (index1 !== -1)
      post.upvotes = post.upvotes.filter((id) => id !== String(req.userId));
  } else {
    post.downvotes = post.downvotes.filter((id) => id !== String(req.userId));
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that ID");

  const post = await PostMessage.findById(_id);
  const sub = await subReddit.findOne({ title: post.subReddit });

  sub.posts = sub.posts.filter((id) => id !== String(_id));

  const updatedSub = await subReddit.findByIdAndUpdate(sub._id, sub, {
    new: true,
  });
  await PostMessage.findByIdAndRemove(_id);
  res.json({ message: "Post deleted Successfully" });
};
