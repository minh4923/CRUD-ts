import { Router } from 'express';
import {
    
    getAllPost,
    getPostById,
    getUserPosts,
    updatePost,
    deletePost,
    createPost,
} from '../Controllers/postController';
import adminVerify from '../middleware/adminVerify';
import userVerify from '../middleware/userVerify';
import postVerify from '../middleware/postVerify';


const router = Router();

router.get('/post', getAllPost);
router.get('/post/:id', postVerify, getPostById);
router.post('/post', userVerify, createPost);
router.put('/post/:id', postVerify, updatePost);
router.delete('/post/:id', postVerify, deletePost);
router.get('/users/:userId/posts', getUserPosts);
export default router;``