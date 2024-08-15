import { Request, Response, NextFunction } from "express";

export const setBaseUrl = (req: Request, res: Response, next: NextFunction) => {
    req.baseUrl = `${req.protocol}://${req.get("host")}`;
    next();
};
