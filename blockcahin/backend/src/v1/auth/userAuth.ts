import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as Constant from '../constants/constant';

export const validateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, Constant.JWT_SECRET) as any;
        req.body.username = decoded.username;
        req.body.permissionsAssigned = decoded.permissions;
        req.body.publicKey = decoded.publicKey;
        next();
    } catch (error: any) {
        console.log('Error occured at userAuth -> validateUser: ', error.message);
        return res.status(500).json({ message: "Error occured Check server logs" });
    }
}