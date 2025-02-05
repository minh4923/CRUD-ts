export class NotFoundError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'Post not found';
        this.statusCode = 404;
    }
}
