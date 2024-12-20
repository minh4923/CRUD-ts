import { Request, Response } from 'express';
import { register, login } from '../src/Controllers/authController';
import authService from '../src/services/authService';

jest.mock('../src/services/authService'); // Mock authService để giả lập hành vi

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));

        mockRequest = {};
        mockResponse = {
            status: statusMock as unknown as Response['status'],
            json: jsonMock as unknown as Response['json'],
        };
    });

    describe('register', () => {
        it('should return 201 and result when register is successful', async () => {
            const mockResult = { message: 'Registered successfully!' };
            (authService.register as jest.Mock).mockResolvedValue(mockResult);

            mockRequest.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(authService.register).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 500 and error message when register fails', async () => {
            const mockError = new Error('Email already exists');
            (authService.register as jest.Mock).mockRejectedValue(mockError);

            mockRequest.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Email already exists',
            });
        });
    });

    describe('login', () => {
        it('should return 200 and result when login is successful', async () => {
            // Giả lập authService.login trả về kết quả thành công
            const mockResult = {
                token: 'fake-jwt-token',
                message: 'Login successful',
            };
            (authService.login as jest.Mock).mockResolvedValue(mockResult);

            mockRequest.body = {
                email: 'test@example.com',
                password: 'password',
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password',
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 and error message when login fails', async () => {
            // Giả lập authService.login ném ra lỗi
            const mockError = new Error('Invalid credentials');
            (authService.login as jest.Mock).mockRejectedValue(mockError);

            mockRequest.body = {
                email: 'test@example.com',
                password: 'wrong-password',
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Invalid credentials',
            });
        });
    });
});
