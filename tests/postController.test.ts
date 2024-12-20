import { Request, Response } from 'express';
import {
    getAllPost,
    getPostById,
    getUserPosts,
    createPost,
    updatePost,
    deletePost,
} from '../src/Controllers/postController';
import postService from '../src/services/postService';

jest.mock('../src/services/postService'); // Mock postService

describe('Post Controller', () => {
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

    describe('getAllPost', () => {
        it('should return posts when successful', async () => {
            const mockPosts = [{ id: 1, title: 'Post 1', content: 'Content 1' }];
            (postService.getAllPost as jest.Mock).mockResolvedValue(mockPosts);

            mockRequest.query = { page: '1', limit: '10' };

            await getAllPost(mockRequest as Request, mockResponse as Response);

            expect(postService.getAllPost).toHaveBeenCalledWith(1, 10);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
        });

        it('should return 500 when service fails', async () => {
            const mockError = new Error('Service failed');
            (postService.getAllPost as jest.Mock).mockRejectedValue(mockError);

            mockRequest.query = { page: '1', limit: '10' };

            await getAllPost(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Service failed' });
        });
    });

    describe('getPostById', () => {
        it('should return a post when successful', async () => {
            const mockPost = { id: 1, title: 'Post 1', content: 'Content 1' };
            (postService.getPostById as jest.Mock).mockResolvedValue(mockPost);

            mockRequest.params = { id: '1' };

            await getPostById(mockRequest as Request, mockResponse as Response);

            expect(postService.getPostById).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it('should return 404 when post not found', async () => {
            const mockError = new Error('Post not found');
            (postService.getPostById as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };

            await getPostById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post not found' });
        });
    });

    describe('createPost', () => {
        it('should create a post and return 201', async () => {
            const mockPost = { id: 1, title: 'Post 1', content: 'Content 1' };
            (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

            mockRequest.body = { title: 'Post 1', content: 'Content 1' };
            mockRequest.headers = { authorization: 'Bearer token' };

            await createPost(mockRequest as Request, mockResponse as Response);

            expect(postService.createPost).toHaveBeenCalledWith({ title: 'Post 1', content: 'Content 1' }, 'token');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
        });

        it('should return 401 when token is invalid', async () => {
            const mockError = new Error('Unauthorized');
            (postService.createPost as jest.Mock).mockRejectedValue(mockError);

            mockRequest.body = { title: 'Post 1', content: 'Content 1' };
            mockRequest.headers = { authorization: '' };

            await createPost(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });
    });

    describe('updatePost', () => {
        it('should update a post and return 201', async () => {
            const mockUpdatedPost = { id: 1, title: 'Updated Post', content: 'Updated Content' };
            (postService.updatePost as jest.Mock).mockResolvedValue(mockUpdatedPost);

            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'Updated Post', content: 'Updated Content' };

            await updatePost(mockRequest as Request, mockResponse as Response);

            expect(postService.updatePost).toHaveBeenCalledWith(
                { title: 'Updated Post', content: 'Updated Content' },
                '1'
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedPost);
        });

        it('should return 400 when update fails', async () => {
            const mockError = new Error('Update failed');
            (postService.updatePost as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };
            mockRequest.body = { title: 'Updated Post', content: 'Updated Content' };

            await updatePost(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Update failed' });
        });
    });

    describe('deletePost', () => {
        it('should delete a post and return success message', async () => {
            (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

            mockRequest.params = { id: '1' };

            await deletePost(mockRequest as Request, mockResponse as Response);

            expect(postService.deletePost).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post deleted ' });
        });

        it('should return 404 when delete fails', async () => {
            const mockError = new Error('Post not found');
            (postService.deletePost as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { id: '1' };

            await deletePost(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Post not found' });
        });
    });

    describe('getUserPosts', () => {
        it('should return user posts when successful', async () => {
            const mockPosts = [{ id: 1, title: 'Post 1', content: 'Content 1' }];
            (postService.getUserPosts as jest.Mock).mockResolvedValue(mockPosts);

            mockRequest.params = { userId: '123' };
            mockRequest.query = { page: '1', limit: '10' };

            await getUserPosts(mockRequest as Request, mockResponse as Response);

            expect(postService.getUserPosts).toHaveBeenCalledWith('123', 1, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPosts);
        });

        it('should return 400 when service fails', async () => {
            const mockError = new Error('Service failed');
            (postService.getUserPosts as jest.Mock).mockRejectedValue(mockError);

            mockRequest.params = { userId: '123' };
            mockRequest.query = { page: '1', limit: '10' };

            await getUserPosts(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Service failed' });
        });
    });
});
