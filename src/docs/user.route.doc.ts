/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     tags: [User]
 *     summary: User Registration
 *     description: Creates a new user account with provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Username and/or email already in use
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/signin:
 *   post:
 *     tags: [User]
 *     summary: User Login
 *     description: Authenticates a user and provides a token for further requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               keepMeSignedIn:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credential or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/editprofile:
 *   post:
 *     tags: [User]
 *     summary: Edit User Profile
 *     description: Updates the user's profile information including profile picture.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User's first name
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               bio:
 *                 type: string
 *                 description: User's bio
 *                 example: Software Developer
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: johndoe@example.com
 *               profileStatus:
 *                 type: string
 *                 enum: [public, private]
 *                 description: User's profile visibility status
 *                 example: public
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file (optional)
 *               password:
 *                 type: string
 *                 description: User's new password (optional)
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                       example: John
 *                     lastname:
 *                       type: string
 *                       example: Doe
 *                     bio:
 *                       type: string
 *                       example: Software Developer
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     profileStatus:
 *                       type: string
 *                       enum: [public, private]
 *                       example: public
 *                     profilePicture:
 *                       type: string
 *                       example: http://localhost:3000/api/images/profiles/profile.jpg
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/geteditprofile:
 *   get:
 *     tags: [User]
 *     summary: Get Editable Profile Information
 *     description: Retrieves the editable profile information of the logged-in user.
 *     responses:
 *       200:
 *         description: Editable profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 firstname:
 *                   type: string
 *                   example: John
 *                 lastname:
 *                   type: string
 *                   example: Doe
 *                 bio:
 *                   type: string
 *                   example: Software Developer
 *                 profileStatus:
 *                   type: string
 *                   example: private
 *                 profilePicture:
 *                   type: string
 *                   example: http://localhost:3000/api/images/profiles/profile.jpg
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/profileInfo:
 *   get:
 *     tags: [User]
 *     summary: Get User Profile Information
 *     description: Retrieves the profile information of the logged-in user, including posts.
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 profileStatus:
 *                   type: string
 *                   example: private
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 firstname:
 *                   type: string
 *                   example: John
 *                 lastname:
 *                   type: string
 *                   example: Doe
 *                 bio:
 *                   type: string
 *                   example: Software Developer
 *                 profilePicture:
 *                   type: string
 *                   example: http://localhost:3000/api/images/profiles/profile.jpg
 *                 follower_count:
 *                   type: integer
 *                   example: 150
 *                 following_count:
 *                   type: integer
 *                   example: 180
 *                 post_count:
 *                   type: integer
 *                   example: 75
 *                 unreadNotifications:
 *                   type: integer
 *                   example: 6
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 12345
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       profilePicture:
 *                         type: string
 *                         example: http://localhost:3000/api/images/profiles/profile.jpg
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: http://localhost:3000/api/images/posts/post1.jpg
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: tag1
 *                       mentions:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: mention1
 *                       like_count:
 *                           type: integer
 *                           example: 100
 *                       comment_count:
 *                           type: integer
 *                           example: 100
 *                       saved_count:
 *                           type: integer
 *                           example: 100
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/forgetpassword:
 *   post:
 *     tags: [User]
 *     summary: Password Reset Request
 *     description: Initiates the password reset process by sending an email to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Credential is required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/resetpassword:
 *   post:
 *     tags: [User]
 *     summary: Reset Password
 *     description: Resets the user's password using a provided token and new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPass:
 *                 type: string
 *                 example: NewStrongPassword123
 *               token:
 *                 type: string
 *                 example: token123
 *     responses:
 *       200:
 *         description: New password set
 *       400:
 *         description: Token and new password are required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/follow/{username}:
 *   post:
 *     tags: [User]
 *     summary: Follow and unfollow a User
 *     description: Allows the logged-in user to follow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to follow
 *         schema:
 *           type: string
 *           example: janedoe
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
 * /api/user/{username}:
 *   get:
 *     tags: [User]
 *     summary: Get User Profile by Username
 *     description: Retrieves the profile information of a user by their username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user
 *         schema:
 *           type: string
 *           example: janedoe
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 firstname:
 *                   type: string
 *                   example: John
 *                 lastname:
 *                   type: string
 *                   example: Doe
 *                 bio:
 *                   type: string
 *                   example: Software Developer
 *                 profilePicture:
 *                   type: string
 *                   example: http://localhost:3000/api/images/profiles/profile.jpg
 *                 follow_status:
 *                   type: string
 *                   enum:
 *                     - followed
 *                     - not followed
 *                     - blocked
 *                     - requested
 *                 follower_count:
 *                   type: integer
 *                   example: 150
 *                 following_count:
 *                   type: integer
 *                   example: 180
 *                 post_count:
 *                   type: integer
 *                   example: 75
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 12345
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       profilePicture:
 *                         type: string
 *                         example: http://localhost:3000/api/images/profiles/profile.jpg
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: http://localhost:3000/api/images/posts/post1.jpg
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: tag1
 *                       mentions:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: mention1
 *                       like_count:
 *                           type: integer
 *                           example: 100
 *                       comment_count:
 *                           type: integer
 *                           example: 100
 *                       saved_count:
 *                           type: integer
 *                           example: 100
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/followers/{username}:
 *   get:
 *     tags: [User]
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
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       follower_count:
 *                         type: integer
 *                       following_count:
 *                         type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found.
 */

/**
 * @swagger
 * /api/user/followings/{username}:
 *   get:
 *     tags: [User]
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
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       follower_count:
 *                         type: integer
 *                       following_count:
 *                         type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found.
 */

/**
 * @swagger
 * /api/user/savepost/{postid}:
 *   post:
 *     tags: [User]
 *     summary: Save and unsave a Post
 *     description: Saves a post to the authenticated user's saved posts list.
 *     parameters:
 *       - name: postid
 *         in: path
 *         required: true
 *         description: The ID of the post to be saved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post successfully saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post saved"
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Not Found.
 *       400:
 *         description: Bad Request. Post is already saved.
 */

/**
 * @swagger
 * /api/user/deletefollower/{username}:
 *   post:
 *     tags: [User]
 *     summary: Delete a follower from follower list
 *     description: Allows the logged-in user to follow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to delete from followers
 *         schema:
 *           type: string
 *           example: janedoe
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
 *     tags: [User]
 *     summary: Accepts a follow request
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           example: janedoe
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
 *     tags: [User]
 *     summary: Rejects a follow request
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           example: janedoe
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
 * /api/user/block/{username}:
 *   post:
 *     tags: [User]
 *     summary: Block and unblock a user
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           example: janedoe
 *     responses:
 *       200:
 *         description: User blocked
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/addclosefriend/{username}:
 *   post:
 *     tags: [User]
 *     summary: Adds and removes user to close friends
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           example: janedoe
 *     responses:
 *       200:
 *         description: User added to close friends
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/closefriendlist:
 *   get:
 *     tags: [User]
 *     summary: Get close friends list
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
 *         description: The number of followings to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
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
 *                       username:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       follower_count:
 *                         type: integer
 *                       following_count:
 *                         type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/user/blocklist:
 *   get:
 *     tags: [User]
 *     summary: Get block list
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
 *         description: The number of followings to return per page. Defaults to 10.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
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
 *                       username:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *                       follower_count:
 *                         type: integer
 *                       following_count:
 *                         type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/user/explore:
 *   get:
 *     tags: [User]
 *     summary: Get explore page posts
 *     responses:
 *       200:
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
 *                         example: 12345
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       profilePicture:
 *                         type: string
 *                         example: http://localhost:3000/api/images/profiles/profile.jpg
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: http://localhost:3000/api/images/posts/post1.jpg
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: tag1
 *                       mentions:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: mention1
 *                       like_count:
 *                         type: integer
 *                         example: 100
 *                       comment_count:
 *                         type: integer
 *                         example: 100
 *                       saved_count:
 *                         type: integer
 *                         example: 100
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/notifications:
 *   get:
 *     tags: [User]
 *     summary: Get notifications
 *     responses:
 *       200:
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
 *                       type:
 *                         type: string
 *                         example: "followed"
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-30T15:54:48.717Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-30T15:54:48.717Z"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       recipient:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe1"
 *                           profilePicture:
 *                             type: string
 *                             example: ""
 *                           firstname:
 *                             type: string
 *                             example: "John"
 *                           lastname:
 *                             type: string
 *                             example: "Doe"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe2"
 *                           email:
 *                             type: string
 *                             example: "johndoe2@example.com"
 *                           profilePicture:
 *                             type: string
 *                             example: ""
 *                           firstname:
 *                             type: string
 *                             example: ""
 *                           lastname:
 *                             type: string
 *                             example: ""
 *                       post:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           images:
 *                             type: string
 *                       comment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           text:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/followingsnotifications:
 *   get:
 *     tags: [User]
 *     summary: Get followings notifications
 *     responses:
 *       200:
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
 *                       type:
 *                         type: string
 *                         example: "followed"
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-30T15:54:48.717Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-30T15:54:48.717Z"
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       recipient:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe1"
 *                           profilePicture:
 *                             type: string
 *                             example: ""
 *                           firstname:
 *                             type: string
 *                             example: "John"
 *                           lastname:
 *                             type: string
 *                             example: "Doe"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe2"
 *                           email:
 *                             type: string
 *                             example: "johndoe2@example.com"
 *                           profilePicture:
 *                             type: string
 *                             example: ""
 *                           firstname:
 *                             type: string
 *                             example: ""
 *                           lastname:
 *                             type: string
 *                             example: ""
 *                       post:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           images:
 *                             type: string
 *                       comment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           text:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
