import postService from '../src/services/postService';
import Post from '../src/models/Post';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/Post');
jest.mock('jsonwebtoken');

describe('PostService', () => {
    describe('getAllPost', () => {
        it('should return posts with pagination', async () => {
            const mockPosts = [{ id: '1', title: 'Post 1', content: 'Content 1' }];
            const mockTotalPosts = 10;

            (Post.find as jest.Mock).mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockPosts),
                }),
            });
            (Post.countDocuments as jest.Mock).mockResolvedValue(mockTotalPosts);

            const result = await postService.getAllPost(1, 10);

            expect(Post.find).toHaveBeenCalled();
            expect(Post.countDocuments).toHaveBeenCalled();
            expect(result).toEqual({
                posts: mockPosts,
                pagination: {
                    total: mockTotalPosts,
                    page: 1,
                    limit: 10,
                    totalPage: 1,
                },
            });
        });
    });

    describe('createPost', () => {
        it('should create a new post when token is valid', async () => {
            const mockToken = 'valid-token';
            const mockDecoded = { userId: 'user1' };
            const mockPost = {
                title: 'Post 1',
                content: 'Content 1',
                author: 'user1',
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
            (Post.prototype.save as jest.Mock).mockResolvedValue(mockPost);

            const result = await postService.createPost({ title: 'Post 1', content: 'Content 1' }, mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'aaa');
            expect(result).toEqual(mockPost);
        });

        it('should throw an error if token is missing', async () => {
            await expect(postService.createPost({ title: 'Post 1', content: 'Content 1' }, '')).rejects.toThrow(
                'Token not require.'
            );
        });

        it('should throw a ValidationError for invalid token', async () => {
            const mockToken = 'invalid-token';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid or expired token');
            });

            await expect(postService.createPost({ title: 'Post 1', content: 'Content 1' }, mockToken)).rejects.toThrow(
                'Invalid or expired token'
            );
        });
    });

    describe('updatePost', () => {
        it('should update a post when valid ID is provided', async () => {
            const mockPost = {
                id: '1',
                title: 'Updated Post',
                content: 'Updated Content',
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockPost);

            const result = await postService.updatePost({ title: 'Updated Post', content: 'Updated Content' }, '1');

            expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
                '1',
                { title: 'Updated Post', content: 'Updated Content' },
                { new: true }
            );
            expect(result).toEqual(mockPost);
        });

        it('should throw a ValidationError for invalid ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

            await expect(postService.updatePost({ title: 'Post', content: 'Content' }, 'invalid-id')).rejects.toThrow(
                'Invalid post Id'
            );
        });

        it('should throw a NotFoundError if post is not found', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(postService.updatePost({ title: 'Post', content: 'Content' }, '1')).rejects.toThrow(
                'Post not found'
            );
        });
    });

    describe('deletePost', () => {
        it('should delete a post when valid ID is provided', async () => {
            const mockPost = { id: '1', title: 'Post 1', content: 'Content 1' };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPost);

            const result = await postService.deletePost('1');

            expect(Post.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockPost);
        });

        it('should throw a ValidationError for invalid ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

            await expect(postService.deletePost('invalid-id')).rejects.toThrow('Invalid post Id');
        });

        it('should throw a NotFoundError if post is not found', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await expect(postService.deletePost('1')).rejects.toThrow('Post not found');
        });
    });

    describe('getUserPosts', () => {
        it('should return user posts with pagination', async () => {
            const mockPosts = [{ id: '1', title: 'Post 1', content: 'Content 1' }];
            const mockTotalPosts = 5;

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            (Post.find as jest.Mock).mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockPosts),
                }),
            });
            (Post.countDocuments as jest.Mock).mockResolvedValue(mockTotalPosts);

            const result = await postService.getUserPosts('user1', 1, 10);

            expect(Post.find).toHaveBeenCalledWith({ author: 'user1' });
            expect(Post.countDocuments).toHaveBeenCalledWith({
                author: 'user1',
            });
            expect(result).toEqual({
                posts: mockPosts,
                pagination: {
                    total: mockTotalPosts,
                    page: 1,
                    limit: 10,
                    totalPage: 1,
                },
            });
        });

        it('should throw a ValidationError for invalid user ID', async () => {
            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

            await expect(postService.getUserPosts('invalid-id', 1, 10)).rejects.toThrow('Invalid user Id');
        });
    });
});
