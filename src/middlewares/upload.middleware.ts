import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../utility/http-errors";
import { RequestHandler } from "express";

// Storage engine for profile pictures
const profileStorage: StorageEngine = multer.diskStorage({
    destination: "./images/profiles/",
    filename: (req, file, cb) => {
        const username = req.user.username;
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
        const username = req.user.username;
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
        cb(new HttpError(400, "Bad Request"));
    }
};

export const profileUpload: RequestHandler = (req, res, next) => {
    const upload = multer({
        storage: profileStorage,
        limits: { fileSize: 2000000 },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        },
    }).single("profilePicture"); //TODO: update after getting name tag from frontend team

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

export const postUpload: RequestHandler = (req, res, next) => {
    const upload = multer({
        storage: postStorage,
        limits: { fileSize: 200000000 },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        },
    }).array("postImage");

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.files || req.files.length == 0) {
            return res
                .status(400)
                .json({ message: "Posts require at least one image" });
        }
        next();
    });
};
