const express = require('express');
const Post = require('./posts-model');

const router = express.Router();

// ---------------------
// [GET] /api/posts
// ---------------------
router.get('/', (req, res) => {
  Post.find()
    .then(posts => {
      res.json(posts);
    })
    .catch(err => {
      res.status(500).json({
        message: "The posts information could not be retrieved",
        error: err.message,
        stack: err.stack,
      });
    });
});

// ---------------------
// [GET] /api/posts/:id
// ---------------------
router.get('/:id', (req, res) => {
  const { id } = req.params;

  Post.findById(id)
    .then(post => {
      if (!post) {
        res.status(404).json({
          message: "The post with the specified ID does not exist",
        });
      } else {
        res.json(post);
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "The post information could not be retrieved",
        error: err.message,
        stack: err.stack,
      });
    });
});

// ---------------------
// [POST] /api/posts
// ---------------------
router.post('/', (req, res) => {
  const { title, contents } = req.body;

  // Check for missing title or contents
  if (!title || !contents) {
    return res.status(400).json({
      message: "Please provide title and contents for the post",
    });
  }

  Post.insert({ title, contents })
    .then(newPost => {
      // Depending on your data layer, `newPost` might be
      // an object with { id: newId }, or the entire new post
      // If it's just the id, do another lookup:
      if (typeof newPost === 'object' && newPost.id) {
        // If the insert method returns an object with `id`,
        // do a findById to get the full post
        return Post.findById(newPost.id);
      } else if (typeof newPost === 'number') {
        // If insert returns just the new ID
        return Post.findById(newPost);
      } else {
        // If insert returns the full post directly
        return newPost;
      }
    })
    .then(insertedPost => {
      res.status(201).json(insertedPost);
    })
    .catch(err => {
      res.status(500).json({
        message: "There was an error while saving the post to the database",
        error: err.message,
        stack: err.stack,
      });
    });
});

// ---------------------
// [DELETE] /api/posts/:id
// ---------------------
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // First, check if the post exists
  Post.findById(id)
    .then(post => {
      if (!post) {
        res.status(404).json({
          message: "The post with the specified ID does not exist",
        });
      } else {
        // If post exists, remove it
        Post.remove(id)
          .then(() => {
            // If your remove method returns the deleted post or a count,
            // you could also return that here if you wish:
            res.json(post); // or simply res.status(200).end();
          })
          .catch(err => {
            res.status(500).json({
              message: "The post could not be removed",
              error: err.message,
              stack: err.stack,
            });
          });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "The post could not be removed",
        error: err.message,
        stack: err.stack,
      });
    });
});

// ---------------------
// [PUT] /api/posts/:id
// ---------------------
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, contents } = req.body;

  // Check for missing title or contents
  if (!title || !contents) {
    return res.status(400).json({
      message: "Please provide title and contents for the post",
    });
  }

  // Check if post exists
  Post.findById(id)
    .then(post => {
      if (!post) {
        res.status(404).json({
          message: "The post with the specified ID does not exist",
        });
      } else {
        // Update the post
        Post.update(id, { title, contents })
          .then(updated => {
            if (!updated) {
              // If the update method indicates no record found/updated
              res.status(404).json({
                message: "The post with the specified ID does not exist",
              });
            } else {
              // Return the updated post
              return Post.findById(id);
            }
          })
          .then(updatedPost => {
            if (updatedPost) {
              res.json(updatedPost);
            }
          })
          .catch(err => {
            res.status(500).json({
              message: "The post information could not be modified",
              error: err.message,
              stack: err.stack,
            });
          });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "The post information could not be modified",
        error: err.message,
        stack: err.stack,
      });
    });
});

// ---------------------
// [GET] /api/posts/:id/comments
// (You have router.get('/:id/messages', but the spec says 'comments'.)
// ---------------------
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;

  // First, confirm the post exists
  Post.findById(id)
    .then(post => {
      if (!post) {
        res.status(404).json({
          message: "The post with the specified ID does not exist",
        });
      } else {
        // If post exists, retrieve its comments
        Post.findPostComments(id)
          .then(comments => {
            res.json(comments);
          })
          .catch(err => {
            res.status(500).json({
              message: "The comments information could not be retrieved",
              error: err.message,
              stack: err.stack,
            });
          });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "The comments information could not be retrieved",
        error: err.message,
        stack: err.stack,
      });
    });
});

module.exports = router;
