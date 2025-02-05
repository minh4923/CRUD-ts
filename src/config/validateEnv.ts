import Joi from 'joi';

const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().default('aaa'),
    MONGODB_URI: Joi.string().uri().required(),
    JWT_EXPIRES_IN:Joi.string().default('3600'),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error && process.env.NODE_ENV !== 'test') {
    throw new Error(`Invalid environment variable: ${error.message}`);
}


export const validatedEnv = {
    PORT: value.PORT,
    JWT_SECRET: value.JWT_SECRET,
    MONGODB_URI: value.MONGODB_URI,
    JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
};

