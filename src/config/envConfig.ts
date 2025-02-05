import { validatedEnv } from './validateEnv';

export const EnvConfig = {
    PORT: validatedEnv.PORT,
    JWT_SECRET: validatedEnv.JWT_SECRET,
    MONGODB_URI: validatedEnv.MONGODB_URI,
    JWT_EXPIRES_IN: validatedEnv.JWT_EXPIRES_IN,
};
