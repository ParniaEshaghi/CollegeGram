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
 *                 example: ["@mention1", "@mention2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
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
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["@newmention1", "@newmention2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
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
