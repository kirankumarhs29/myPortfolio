const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
//  @route /get / api/posts
// desc  create a post
//  @access private
router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

//  @route /get / api/posts
// desc  create all post
//  @access public
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//  @route /get / api/posts/:id
// desc  get one post  by id
//  @access public
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(post);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//  @route delete / api/posts/:id
// desc  detele all post
//  @access public
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // ?check user
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorised" });
    }
    await post.remove();
    res.json({ msg: "post removed" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("server error");
  }
});

//  @route put / api/posts/like/:id
// desc  like a post
//  @access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//  @route put / api/posts/unlike/:id
// desc  unlikelike a post
//  @access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post has not yet liked" });
    }
    // get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//  @route /get / api/posts/comments:id
// desc  create a post
//  @access private
router.post(
  "/comment/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.Comments.unshift(newComment);
      await post.save();
      res.json(post.Comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

//  @route /get / api/posts/comments:id/:comment_id
// desc  delete a comment
//  @access private
router.delete("/comments/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // pull out a comment
    const comment = post.Comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "comment does not exist" });
    }
    // check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorised" });
    }
    // get remove index
    const removeIndex = post.Comments.map((comment) =>
      comment.user.toString()
    ).indexOf(req.user.id);
    post.Comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.Comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});
module.exports = router;
