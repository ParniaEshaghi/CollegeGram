/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts, including creation, retrieval, updates, and interactions such as likes.
 *   - name: Comments
 *     description: API for managing comments on posts, including creating, liking, and retrieving nested comments.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *           description: URL of the user's profile picture
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the post.
 *         caption:
 *           type: string
 *           description: Caption for the post, including hashtags.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the post.
 *         mentions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of users mentioned in the post.
 *         like_count:
 *           type: integer
 *           description: Number of likes the post has received.
 *         comment_count:
 *           type: integer
 *           description: Number of comments on the post.
 *         saved_count:
 *           type: integer
 *           description: Number of times the post has been saved by users.
 *         close_status:
 *           type: string
 *           enum:
 *             - normal
 *             - close
 *           description: Visibility status of the post.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     PostWithLikeAndSaveStatus:
 *       allof:
 *         - $ref: '#/components/schemas/Post'
 *         - type: object
 *           properties:
 *             like_status:
 *               type: boolean
 *               description: Whether the post is liked by the current user.
 *             save_status:
 *               type: boolean
 *               description: Whether the post is saved by the current user.
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         postId:
 *           type: string
 *         text:
 *           type: string
 *           description: The content of the comment.
 *         commentId:
 *           type: string
 *           description: ID of the parent comment (if nested).
 *         like_count:
 *           type: integer
 *           description: Number of likes the comment has received.
 *         username:
 *           type: string
 *           description: The username of the commenter.
 *         profilePicture:
 *           type: string
 *           description: URL of the commenter's profile picture.
 *         firstname:
 *           type: string
 *           description: Commenter’s first name.
 *         lastname:
 *           type: string
 *           description: Commenter’s last name.
 *         like_status:
 *           type: boolean
 *           description: Whether the comment is liked by the current user.
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Nested comments (replies).
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *     Unauthorized:
 *       description: Unauthorized
 *     NotFound:
 *       description: Resource not found
 *     InternalServerError:
 *       description: Internal server error
 *     Forbidden:
 *       description: Forbidden
 */

/**
 * @swagger
 * /api/post/createpost:
 *   post:
 *     summary: Create a new post
 *     description: Endpoint to create a new post with images and captions. Users can also add mentions and select the post visibility.
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
 *                 description: Caption for the post including hashtags.
 *                 example: "This is a post caption #tag1"
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "mention1"
 *                 description: List of users to mention in the post.
 *                 example: ["mention1", "mention2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images to be uploaded with the post.
 *               close_status:
 *                 type: string
 *                 description: Visibility status of the post. If not provided defaults to normal.
 *                 enum:
 *                   - normal
 *                   - close
 *             required:
 *               - images
 *           encoding:
 *             mentions:
 *               style: form
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/post/updatepost/{postid}:
 *   post:
 *     summary: Update a post
 *     description: Endpoint to update an existing post. Users can change the caption, add/remove images, and update mentions.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postid
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Updated caption for the post.
 *                 example: "Updated caption #newtag"
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of mentions.
 *                 example: ["newmention1", "newmention2"]
 *               deletedImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of image URLs to delete.
 *                 example: ["staticimagelink1", "staticimagelink2"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to add to the post.
 *               close_status:
 *                 type: string
 *                 description: Updated visibility status of the post. If not provided defaults to normal.
 *                 enum:
 *                   - normal
 *                   - close
 *           encoding:
 *             mentions:
 *               style: form
 *             deletedImages:
 *               style: form
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/post/likepost/{postid}:
 *   post:
 *     summary: Like and unlike a Post
 *     description: Like or unlike a post for the authenticated user.
 *     tags: [Posts]
 *     parameters:
 *       - name: postid
 *         in: path
 *         required: true
 *         description: The ID of the post to be liked.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post successfully liked or unliked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post liked"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/post/{postid}:
 *   get:
 *     summary: Get post by ID
 *     description: Retrieve a post by its ID along with associated data such as images, captions, tags, and mentions.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postid
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to retrieve.
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostWithLikeAndSaveStatus'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/post/comment:
 *   post:
 *     summary: Create a new comment
 *     description: Creates a new comment for a specified post. Comments can also be nested as replies to other comments.
 *     tags: [Comments]
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
 *                 format: uuid
 *                 description: Id of the post that the comment is for.
 *               text:
 *                 type: string
 *                 description: The comment content
 *               commentId:
 *                 type: string
 *                 format: uuid
 *                 description: Id of the comment that parents the new comment. Should be provided if the comment is a reply to another comment.
 *             required:
 *               - postId
 *               - text
 *     responses:
 *       200:
 *         description: Successfully created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/post/likecomment/{commentid}:
 *   post:
 *     summary: Like and unlike a Comment
 *     description: Like or unlike a comment for the authenticated user.
 *     tags: [Comments]
 *     parameters:
 *       - name: commentid
 *         in: path
 *         required: true
 *         description: The ID of the comment to be liked.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment successfully liked or unliked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment liked"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/post/comments/{postid}:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve comments for a specific post, including nested comments. Supports pagination.
 *     tags: [Comments]
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
 *                     $ref: '#/components/schemas/Comment'
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
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
