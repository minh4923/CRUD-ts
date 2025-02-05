import { error } from 'console';
import Post, { IPost } from '../models/Post';
import mongoose, { skipMiddlewareFunction } from 'mongoose';
import jwt from 'jsonwebtoken';
import { Pagination } from '../interfaces/Paginations';
import { ValidationError } from '../Errors/ValidationError';
import { NotFoundError } from '../Errors/NotFoundError';
import { validatedEnv } from '../config/validateEnv';

const secret = validatedEnv.JWT_SECRET;

class PostService {
    async getAllPost(page: number = 1, limit: number = 10): Promise<{ posts: IPost[]; pagination: Pagination }> {
        const skip = (page - 1) * limit;
        const posts = await Post.find().skip(skip).limit(limit);
        const totalPosts = await Post.countDocuments();

        return {
            posts,
            pagination: {
                total: totalPosts,
                page,
                limit,
                totalPage: Math.ceil(totalPosts / limit),
            },
        };
    }

    async createPost(data: { title: string; content: string }, token: string): Promise<IPost | null> {
        if (!token) {
            throw new Error('Token not require.');
        }
        let userId: string;
        try {
            const decoded = jwt.verify(token, secret) as { userId: string };
            userId = decoded.userId;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
        const newPost = new Post({
            title: data.title,
            content: data.content,
            author: userId,
        });
        const post = await newPost.save();
        return post;
    }

    async updatePost(data: { title?: string; content?: string }, id: string): Promise<IPost | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid post Id');
        }

        const updatedPost = await Post.findByIdAndUpdate(id, data, { new: true });
        if (!updatedPost) {
            throw new NotFoundError('Post not found');
        }

        return updatedPost;
    }

    async deletePost(id: string): Promise<IPost | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid post Id');
        }
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            throw new NotFoundError('Post not found');
        }

        return post;
    }

    async getUserPosts(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ posts: IPost[]; pagination: Pagination }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ValidationError('Invalid user Id');
        }
        const skip = (page - 1) * limit;
        const posts = await Post.find({ author: userId }).skip(skip).limit(limit);
        const totalPosts = await Post.countDocuments({ author: userId });

        return {
            posts,
            pagination: {
                total: totalPosts,
                page,
                limit,
                totalPage: Math.ceil(totalPosts / limit),
            },
        };
    }
}

export default new PostService();
