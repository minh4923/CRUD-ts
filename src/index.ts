import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import createAdmin from './scripts/createAdmin';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
dotenv.config();
const MongoDB = process.env.MONGODB_URI;
const app = express();
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Connected to MongoDB');
        createAdmin();
    })
    .catch((err) => {
        console.log(process.env.MONGODB_URI);
        console.error('MongoDB connection error: ', err);
    });

app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', authRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
