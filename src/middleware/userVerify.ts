import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const secret: string = process.env.JWT_SEC || 'aaa';
interface DecodedToken {
    userId: string;
    role: string;
}
interface CustomeRequest extends Request {
    userId?: string;
    role?: string;
}
const userVerify = (
    req: CustomeRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: 'Token not required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as DecodedToken;
        req.userId = decoded.userId;
        req.role = decoded.role;
        if (!req.userId) {
            res.status(403).json({
                message: 'Access denied: Please register an account',
            });
            return;
        }
        next();
    } catch (err: any) {
        res.status(401).json({
            message: 'Invalid or expired token',
            error: err.message,
        });
        return;
    }
};
export default userVerify;
