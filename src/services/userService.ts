import User, { IUser } from '../models/User'; 
import mongoose  from 'mongoose';

interface Pagination{
    total: number;
    page: number;
    limit: number;
    totalPage: number;
}

class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string){
        super(message);
        this.name = 'NotFoundError';    
        this.statusCode = 404;
    }
}

class ValidationError extends Error{
    statusCode: number;
    constructor(message: string){
        super(message);
        this.name = 'ValidationError';
        this.statusCode =  400;
    }
}

class UserService {
    async getAllUsers(page: number = 1, limit: number = 1): Promise<{users: IUser[], pagination: Pagination}>{
        const skip = (page - 1)*limit;
        const users = await User.find().skip(skip).limit(limit);
        const totalUsers = await User.countDocuments();

        return {
            users, 
            pagination: {
                total: totalUsers,
                page, 
                limit,
                totalPage: Math.ceil(totalUsers / limit),
            },
        };
    }

    async getUserById(id: string): Promise<IUser | null> {
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new ValidationError('Invalid user Id');   
        }       
        const user = await User.findById(id);

        if(!user){
            throw new NotFoundError('User not found');
            
        }

        return user;
        
    }


    async updateUserById(id: string, data: {name?:string, password?:string}): Promise<IUser | null> {
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new ValidationError('Invalid user Id');
        }
        const updateData: {name?: string, password?: string} = {};
        if(data.name){
            updateData.name = data.name;
        }
        if(data.password){
            updateData.password = data.password;
        }
        const user = await User.findByIdAndUpdate(id, updateData, {new: true});
        if(!user){
            throw new NotFoundError('User not found');
            
        }
        return user;

    }


    async deleteUserById(id: string): Promise<IUser | null> {
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new ValidationError('Invalid user Id');
        }
        const user = await User.findByIdAndDelete(id);
        if(!user){
            throw new NotFoundError('User not found');
        }
        return user;
    }


}

export default new UserService();
