import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';
import Post from '../models/Post';
import { error } from 'console';
import { validatedEnv } from '../config/validateEnv';
const secret = validatedEnv.JWT_SECRET;
interface DecodedToken {
    userId: string;
    role: string;
}
interface CustomRequest extends Request {
    userId?: string;
    role?: string;
}
const postVerify = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: 'Token not required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, secret) as DecodedToken;
        req.userId = decoded.userId;
        req.role = decoded.role;
        if (req.role !== 'admin' && req.role !== 'user') {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        if (req.role === 'user' && post.author.toString() !== req.userId) {
            res.status(403).json({
                message: 'Access denied: You are not the owner',
            });
            return;
        }
        next();
    } catch (err: any) {
        res.status(403).json({
            message: 'Acess denide: You are not the owner',
            error: err.message,
        });
        return;
    }
};

export default postVerify;
