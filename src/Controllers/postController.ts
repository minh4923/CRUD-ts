import { Request, Response } from 'express';
import postService from '../services/postService';

interface QueryParams {
    page?: string;
    limit?: string;
}

interface PostData {
    title: string;
    content: string;
}

const getAllPost = async (req: Request, res: Response): Promise<void> => {
    const { page = '1', limit = '10' }: QueryParams = req.query;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 1;
    try {
        const posts = await postService.getAllPost(parsedPage, parsedLimit);
        res.json(posts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

const getPostById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const post = await postService.getPostById(id);
        res.json(post);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

const createPost = async (req: Request, res: Response): Promise<void> => {
    const data: PostData = req.body;
    const token = req.headers['authorization']?.split(' ')[1] || ' ';
    try { 
        const newPost = await postService.createPost(data, token);
        res.status(201).json(newPost);
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
};

const updatePost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: PostData = req.body;
    try {
        const updatePost = await postService.updatePost(data, id);
        res.status(201).json(updatePost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await postService.deletePost(id);
        res.json({ message: 'Post deleted ' });
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

const getUserPosts = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { page = '1', limit = '1' }: QueryParams = req.query || '';
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 1;
    try {
        const userPosts = await postService.getUserPosts(
            userId,
            parsedPage,
            parsedLimit
        );
        res.status(200).json(userPosts);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
export {
    getAllPost,
    getPostById,
    getUserPosts,
    createPost,
    updatePost,
    deletePost,
};
