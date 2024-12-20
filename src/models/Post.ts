import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
}

const postSchema: Schema = new Schema(
    {
        title: {
            type: String,
            minlength: 1,
            maxlength: 30,
            required: true,
        },

        content: {
            type: String,
            minlength: 1,
            maxlength: 6000,
            required: true,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model<IPost>('Post', postSchema);
export default Post;
