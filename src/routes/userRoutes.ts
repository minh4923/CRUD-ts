import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
} from '../Controllers/userController';
import adminVerify from '../middleware/adminVerify';

const router = Router();

router.get('/users', adminVerify, getAllUsers);
router.get('/users/:id', adminVerify, getUserById);
router.put('/users/:id', adminVerify, updateUserById);
router.delete('/users/:id', adminVerify, deleteUserById);
export default router;
