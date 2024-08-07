import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Storage engine for profile pictures
const profileStorage: StorageEngine = multer.diskStorage({
    destination: "./images/profiles/",
    filename: (req, file, cb) => {
        const username = req.body.username;
        cb(
            null,
            `${username}-profile-${uuidv4()}${path.extname(file.originalname)}`
        );
    },
});

// Storage engine for post pictures
const postStorage: StorageEngine = multer.diskStorage({
    destination: "./images/posts/",
    filename: (req, file, cb) => {
        const username = req.body.userId;
        cb(
            null,
            `${username}-post-${uuidv4()}${path.extname(file.originalname)}`
        );
    },
});

// Check File Type
const checkFileType = (file: Express.Multer.File, cb: FileFilterCallback) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error("Error: Images Only!"));
    }
};

// Initialize multer for profile and post uploads
export const profileUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single("profileImage"); //TODO: update after getting name tag from frontend team

export const postUpload = multer({
    storage: postStorage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single("postImage");
