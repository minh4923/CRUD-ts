import { Request, Response } from 'express';
import { getAllUsers, getUserById, updateUserById, deleteUserById } from '../src/Controllers/userController';
import userService from '../src/services/userService';

jest.mock('../src/services/userService'); // Mock userService để giả lập hành vi

describe('User Controller', () => {
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

    describe('getAllUsers', () => {
        it('should return users when successful', async () => {
            const mockUsers = [{ id: 1, name: 'John Doe' }];
            (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

            mockRequest.query = { page: '1', limit: '10' };

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(userService.getAllUsers).toHaveBeenCalledWith(1, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
        });

        it('should return 404 when service fails', async () => {
            const mockError = new Error('Users not found');
            (userService.getAllUsers as jest.Mock).mockRejectedValue(mockError);

            mockRequest.query = { page: '1', limit: '10' };

            await getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Users not found',
            });
        });
    });

    describe('getUserById', () => {
        it('should return user when successful', async () => {
            const mockUser = { id: 1, name: 'John Doe' };
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            mockRequest.params = { id: '1' };

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(userService.getUserById).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 when user not found', async () => {
            const mockError = new Error('User not found');
            (userService.getUserById as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };

            await getUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'User not found',
            });
        });
    });

    describe('updateUserById', () => {
        it('should update user and return updated user when successful', async () => {
            const mockUpdatedUser = { id: 1, name: 'John Updated' };
            (userService.updateUserById as jest.Mock).mockResolvedValue(mockUpdatedUser);

            mockRequest.params = { id: '1' };
            mockRequest.body = {
                name: 'John Updated',
                password: 'newpassword',
            };

            await updateUserById(mockRequest as Request, mockResponse as Response);

            expect(userService.updateUserById).toHaveBeenCalledWith('1', {
                name: 'John Updated',
                password: 'newpassword',
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
        });

        it('should return 404 when update fails', async () => {
            const mockError = new Error('Update failed');
            (userService.updateUserById as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };
            mockRequest.body = {
                name: 'John Updated',
                password: 'newpassword',
            };

            await updateUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Update failed',
            });
        });
    });

    describe('deleteUserById', () => {
        it('should delete user and return success message when successful', async () => {
            const mockDeletedUser = { message: 'User deleted successfully' };
            (userService.deleteUserById as jest.Mock).mockResolvedValue(mockDeletedUser);

            mockRequest.params = { id: '1' };

            await deleteUserById(mockRequest as Request, mockResponse as Response);

            expect(userService.deleteUserById).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockDeletedUser);
        });

        it('should return 404 when delete fails', async () => {
            const mockError = new Error('Delete failed');
            (userService.deleteUserById as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };

            await deleteUserById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Delete failed',
            });
        });
    });
});
