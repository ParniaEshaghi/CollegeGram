/**
 * @swagger
 * tags:
 *   - name: UserRelations
 *     description: User relation management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         profileStatus:
 *           type: string
 *           enum:
 *             - public
 *             - private
 *         bio:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *         post_count:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         profilePicture:
 *           type: string
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *         followStatus:
 *           type: string
 *           enum:
 *             - followed
 *             - not followed
 *             - requested
 *             - blocked
 *             - user blocked
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         caption:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         mentions:
 *           type: array
 *           items:
 *             type: string
 *         like_count:
 *           type: integer
 *         comment_count:
 *           type: integer
 *         saved_count:
 *           type: integer
 *         close_status:
 *           type: string
 *           enum:
 *             - normal
 *             - close
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
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         profilePicture:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         follower_count:
 *           type: integer
 *         following_count:
 *           type: integer
 *     Meta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPage:
 *           type: integer
 *         limit:
 *           type: integer
 */

/**
 * @swagger
 * /api/user/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get User Profile by Username
 *     description: Retrieves the profile information of a user by their username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/follow/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Follow a User
 *     description: Allows the logged-in user to follow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to follow
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/unfollow/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Unfollow a User
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to unfollow
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/deletefollower/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Delete a follower from follower list
 *     description: Allows the logged-in user to delete a follower.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to delete from followers
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Follower deleted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/acceptrequest/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Accept a follow request
 *     description: Allows the logged-in user to accept a follow request.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose follow request is being accepted
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Request accepted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/rejectrequest/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Reject a follow request
 *     description: Allows the logged-in user to reject a follow request.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose follow request is being rejected
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: Request rejected
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/followers/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get Followers
 *     description: Retrieves a list of followers for a specified user.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user whose followers are being fetched.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of followers to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of followers for the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */

/**
 * @swagger
 * /api/user/followings/{username}:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get Followings
 *     description: Retrieves a list of users that the specified user is following.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user whose followings are being fetched.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of followings to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of users that the specified user is following.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */

/**
 * @swagger
 * /api/user/block/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Block and unblock a user
 *     description: Allows the logged-in user to block or unblock another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to block or unblock
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User blocked or unblocked
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/addclosefriend/{username}:
 *   post:
 *     tags: [UserRelations]
 *     summary: Add or remove a user from close friends
 *     description: Allows the logged-in user to add or remove another user from their close friends list.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to add or remove from close friends
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User added to or removed from close friends
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/closefriendlist:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get close friends list
 *     description: Retrieves the list of close friends for the logged-in user.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of close friends to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of close friends for the logged-in user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/blocklist:
 *   get:
 *     tags: [UserRelations]
 *     summary: Get block list
 *     description: Retrieves the list of users blocked by the logged-in user.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of blocked users to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of blocked users for the logged-in user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
