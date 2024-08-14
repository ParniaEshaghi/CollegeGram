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
 *     description: Updates user profile information including profile picture.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: firstname
 *         type: string
 *         required: true
 *         description: User's first name
 *       - in: formData
 *         name: lastname
 *         type: string
 *         required: true
 *         description: User's last name
 *       - in: formData
 *         name: bio
 *         type: string
 *         required: false
 *         description: User's bio (optional)
 *       - in: formData
 *         name: profilePicture
 *         type: file
 *         required: false
 *         description: Profile picture file (optional)
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
 *     description: Retrieves the profile information of the logged-in user.
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
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
 *     summary: Follow a User
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
 * /api/user/unfollow/{username}:
 *   post:
 *     tags: [User]
 *     summary: Unfollow a User
 *     description: Allows the logged-in user to unfollow another user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to unfollow
 *         schema:
 *           type: string
 *           example: janedoe
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
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
