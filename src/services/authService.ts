import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { error } from 'console';
import { LoginParams } from '../interfaces/LoginParams';
import { RegisterParams } from '../interfaces/ResgisterParams';
import { validatedEnv } from '../config/validateEnv';
const secret = validatedEnv.JWT_SECRET;
class AuthService {
    async register({ name, email, password }: RegisterParams): Promise<{ message: string }> {
        const existingUser = (await User.findOne({ email })) as IUser | null;
        if (existingUser) {
            throw new Error('Email has been used');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        return { message: 'Registered successfully!' };
    }

    async login({ email, password }: LoginParams): Promise<{ token: string; userId: string }> {
        const user = (await User.findOne({ email })) as IUser | null;
        if (!user) {
            throw new Error('User not exist');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Password is incorrect');
        }
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            secret,
            { expiresIn: validatedEnv.JWT_EXPIRES_IN }
        );
        const userId: string = user.id;
        
        return { token, userId };
    }
}

export default new AuthService();
