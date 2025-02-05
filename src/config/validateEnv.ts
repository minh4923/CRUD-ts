import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });   
const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().default('aaa'),
    MONGODB_URI: Joi.string().uri().required(),
    JWT_EXPIRES_IN: Joi.string().default('3600'),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error && process.env.NODE_ENV !== 'test') {
    throw new Error(`Invalid environment variable: ${error.message}`);
}

export const validatedEnv = value;
