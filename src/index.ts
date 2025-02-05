import './config/env'
import express from 'express';
import mongoose from 'mongoose';
import createAdmin from './scripts/createAdmin';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import { validatedEnv } from './config/validateEnv';
const app = express();
app.use(express.json());

mongoose
    .connect(validatedEnv.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        createAdmin();
    })
    .catch((err) => {
        console.error('MongoDB connection error: ', err);
    });

app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', authRoutes);
const PORT = validatedEnv.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${validatedEnv.PORT}`);
});
