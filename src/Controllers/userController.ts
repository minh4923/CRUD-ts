import e, { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

interface QueryParams {
    page?: string;
    limit?: string;
}

interface UserData {
    name: string;
    password: string;
}

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const { page = '1', limit = '10' }: QueryParams = req.query;
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    try {
        const users = await userService.getAllUsers(parsedPage, parsedLimit);
        res.status(200).json(users);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};
const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).json(user);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

const updateUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data: UserData = req.body;
        const user = await userService.updateUserById(id, data);
        res.status(200).json(user);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};

const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.deleteUserById(id);
        res.status(200).json(user);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};
export { getAllUsers, getUserById, updateUserById, deleteUserById };
