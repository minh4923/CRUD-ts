import AuthService from '../src/services/authService';
import User, { IUser } from '../src/models/User';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            const result = await AuthService.register(userData);

            expect(result).toEqual({ message: 'Registered successfully!' });

            const user = await User.findOne({ email: userData.email });
            expect(user).toBeDefined();
            expect(user?.name).toBe(userData.name);
            expect(user?.password).toBe('hashed_password');
        });

        it('should throw an error if email already exists', async () => {
            await User.create({ name: 'John Doe', email: 'john@example.com', password: 'hashed_password' });

            await expect(
                AuthService.register({ name: 'John Doe', email: 'john@example.com', password: 'password123' })
            ).rejects.toThrow('Email has been used');
        });
    });

    describe('login', () => {
        it('should return a token and userId when login is successful', async () => {
            const user = await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashed_password',
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mocked_token');

            const result = await AuthService.login({ email: user.email, password: 'password123' });

            expect(result).toEqual({ token: 'mocked_token', userId: user.id });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
            expect(jwt.sign).toHaveBeenCalled();
        });

        it('should throw an error if user does not exist', async () => {
            await expect(
                AuthService.login({ email: 'nonexistent@example.com', password: 'password123' })
            ).rejects.toThrow('User not exist');
        });

        it('should throw an error if password is incorrect', async () => {
            const user = await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashed_password',
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(AuthService.login({ email: user.email, password: 'wrongpassword' })).rejects.toThrow(
                'Password is incorrect'
            );
        });
    });
});
