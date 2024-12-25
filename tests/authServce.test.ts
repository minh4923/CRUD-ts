import authService from '../src/services/authService';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User'); // Mock User model
jest.mock('bcryptjs'); // Mock bcrypt
jest.mock('jsonwebtoken'); // Mock jwt

describe('AuthService', () => {
    describe('register', () => {
        it('should register a new user successfully', async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            (User.findOne as unknown as jest.Mock).mockResolvedValue(null); // Giả lập email chưa được sử dụng
            (User as unknown as jest.Mock).mockImplementation(() => ({
                save: mockSave,
            }));
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // Giả lập bcrypt.hash

            const result = await authService.register({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Registered successfully!' });
        });

        it('should throw an error if email already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({});

            await expect(
                authService.register({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                })
            ).rejects.toThrow('Email has been used');

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
        });
    });

    describe('login', () => {
        it('should log in a user successfully and return a token', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith({ userId: '123', role: 'user' }, 'aaa', { expiresIn: '10m' });
            expect(result).toEqual({
                token: 'fakeToken',
                message: 'User logged in successfully',
                userId: '123',
            });
        });

        it('should log in an admin successfully and return a token', async () => {
            const mockUser = {
                id: '123',
                email: 'admin@example.com',
                password: 'hashedPassword',
                role: 'admin',
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

            const result = await authService.login({
                email: 'admin@example.com',
                password: 'password123',
            });

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'admin@example.com',
            });
            expect(result).toEqual({
                token: 'fakeToken',
                message: 'Admin logged in successfully',
                userId: '123',
            });
        });

        it('should throw an error if user does not exist', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null); // Giả lập không tìm thấy user

            await expect(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
            ).rejects.toThrow('User not exist');

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'nonexistent@example.com',
            });
        });

        it('should throw an error if password is incorrect', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login({
                    email: 'test@example.com',
                    password: 'wrongPassword',
                })
            ).rejects.toThrow('Password is incorrect');

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
        });
    });
});
