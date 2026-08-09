import Post from "../models/Post.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกหัวข้อและเนื้อหาโพสต์",
      });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.userId,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) {
      return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์แก้ไขโพสต์นี้" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "ไม่พบโพสต์นี้" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ลบโพสต์นี้" });
    }

    await post.deleteOne();
    res.json({ success: true, message: "ลบโพสต์เรียบร้อยแล้ว" });
  } catch (error) {
    next(error);
  }
};
