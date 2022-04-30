const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
//  @route /get / api/posts
// desc test
//  @access public
router.get('/', (req, res) => res.send('posts route'));

module.exports = router;