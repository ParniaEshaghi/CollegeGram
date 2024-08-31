/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /api/post/createpost:
 *   post:
 *     summary: Create a new post
 *     description: Endpoint to create a new post with images.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 example: "This is a post caption #tag1"
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "mention1"
 *                 example: ["mention1", "mention2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               close_status:
 *                 type: string
 *                 enum:
 *                   - close
 *                   - normal
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of image URLs for the created post.
 *                 caption:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 mentions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/post/{postid}:
 *   get:
 *     summary: Get post by ID
 *     description: Retrieve a post by its ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postid
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 caption:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 mentions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 like_status:
 *                   type: boolean
 *                 save_status:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/post/updatepost/{postid}:
 *   post:
 *     summary: Update a post
 *     description: Endpoint to update an existing post with new images and caption.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postid
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: The updated caption for the post.
 *                 example: "Updated caption #newtag"
 *               deletedImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["staticimagelink", "staticimagelink"]
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mention1", "mention2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               close_status:
 *                 type: string
 *                 enum:
 *                   - close
 *                   - normal
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the updated post.
 *                 username:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 caption:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 mentions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/post/likepost/{postid}:
 *   post:
 *     tags: [Posts]
 *     summary: Like a Post
 *     description: Likes a post for the authenticated user.
 *     parameters:
 *       - name: postid
 *         in: path
 *         required: true
 *         description: The ID of the post to be liked.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Post successfully liked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post liked"
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Not Found.
 *       '400':
 *         description: Bad Request. Post is already liked.
 */

/**
 * @swagger
 * /api/post/unlikepost/{postid}:
 *   post:
 *     tags: [Posts]
 *     summary: Unlike a Post
 *     description: Removes a like from a post for the authenticated user.
 *     parameters:
 *       - name: postid
 *         in: path
 *         required: true
 *         description: The ID of the post to be unliked.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Post successfully unliked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post unliked"
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Not Found.
 *       '400':
 *         description: Bad Request. Post is not liked.
 */

/**
 * @swagger
 * /api/post/likecomment/{commentid}:
 *   post:
 *     tags: [Posts]
 *     summary: Like a Comment
 *     description: Likes a comment for the authenticated user.
 *     parameters:
 *       - name: commentid
 *         in: path
 *         required: true
 *         description: The ID of the comment to be liked.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comment successfully liked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment liked"
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Not Found.
 *       '400':
 *         description: Bad Request. Comment is already liked.
 */

/**
 * @swagger
 * /api/post/unlikecomment/{commentid}:
 *   post:
 *     tags: [Posts]
 *     summary: Unlike a Comment
 *     description: Removes a like from a comment for the authenticated user.
 *     parameters:
 *       - name: commentid
 *         in: path
 *         required: true
 *         description: The ID of the comment to be unliked.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comment successfully unliked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment unliked"
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Not Found.
 *       '400':
 *         description: Bad Request. Comment is not liked.
 */

/**
 * @swagger
 * /api/post/comment:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new comment
 *     description: Creates a new comment for a specified post.
 *     requestBody:
 *       description: Comment object that needs to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               text:
 *                 type: string
 *               commentId:
 *                 type: string
 *                 example: Id of the parent comment (optional)
 *             required:
 *               - postId
 *               - text
 *     responses:
 *       200:
 *         description: Successfully created comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 like_count:
 *                   type: integer
 *                 text:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found.
 */

/**
 * @swagger
 * /api/post/comments/{postid}:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve comments for a specific post, including nested comments.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to retrieve comments for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID of the comment
 *                       text:
 *                         type: string
 *                         description: Content of the comment
 *                       like_count:
 *                         type: integer
 *                       username:
 *                         type: string
 *                         description: Username of the comment author
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                           example: 'nested comments'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of comments per page
 *                     total:
 *                       type: integer
 *                       description: Total number of comments
 *                     totalPage:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found
 */
