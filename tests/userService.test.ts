import userService from '../src/services/userService';
import User from '../src/models/User';
import mongoose from 'mongoose';

jest.mock('../src/models/User'); // Mock User model

describe('UserService', () => {
    describe('getAllUsers', () => {
        it('should return users with pagination', async () => {
            const mockUsers = [{ id: '1', name: 'User 1' }];
            const mockTotalUsers = 10;

            (User.find as jest.Mock).mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockUsers),
                }),
            });
            (User.countDocuments as jest.Mock).mockResolvedValue(
                mockTotalUsers
            );

            const result = await userService.getAllUsers(1, 10);

            expect(User.find).toHaveBeenCalled();
            expect(User.countDocuments).toHaveBeenCalled();
            expect(result).toEqual({
                users: mockUsers,
                pagination: {
                    total: mockTotalUsers,
                    page: 1,
                    limit: 10,
                    totalPage: 1,
                },
            });
        });
    });

    describe('getUserById', () => {
        it('should return a user when valid ID is provided', async () => {
            const mockUser = { id: '1', name: 'User 1' };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserById('1');

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('1');
            expect(User.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw a ValidationError for invalid ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                false
            );

            await expect(userService.getUserById('invalid-id')).rejects.toThrow(
                'Invalid user Id'
            );
        });

        it('should throw a NotFoundError if the user is not found', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findById as jest.Mock).mockResolvedValue(null);

            await expect(userService.getUserById('1')).rejects.toThrow(
                'User not found'
            );
        });
    });

    describe('updateUserById', () => {
        it('should update user and return the updated user', async () => {
            const mockUpdatedUser = { id: '1', name: 'Updated User' };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(
                mockUpdatedUser
            );

            const result = await userService.updateUserById('1', {
                name: 'Updated User',
            });

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                '1',
                { name: 'Updated User' },
                { new: true }
            );
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw a ValidationError for invalid ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                false
            );

            await expect(
                userService.updateUserById('invalid-id', { name: 'User' })
            ).rejects.toThrow('Invalid user Id');
        });

        it('should throw a NotFoundError if the user is not found', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(
                userService.updateUserById('1', { name: 'User' })
            ).rejects.toThrow('User not found');
        });
    });

    describe('deleteUserById', () => {
        it('should delete a user and return the deleted user', async () => {
            const mockUser = { id: '1', name: 'User 1' };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.deleteUserById('1');

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw a ValidationError for invalid ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                false
            );

            await expect(
                userService.deleteUserById('invalid-id')
            ).rejects.toThrow('Invalid user Id');
        });

        it('should throw a NotFoundError if the user is not found', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(
                true
            );
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await expect(userService.deleteUserById('1')).rejects.toThrow(
                'User not found'
            );
        });
    });
});
