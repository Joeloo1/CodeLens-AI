import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, required = true): string => {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`Missing env: ${key}`);
  }

  return value ?? '';
};

const getNumber = (key: string, required = true): number => {
  const value = getEnv(key, required);
  const num = Number(value);

  if (required && isNaN(num)) {
    throw new Error(`Invalid number for env: ${key}`);
  }

  return num;
};

export const config = {
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: getNumber('PORT'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  PASSWORD_SALT_ROUNDS: getNumber('PASSWORD_SALT_ROUNDS'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN'),

  REDIS_HOST: getEnv('REDIS_HOST'),
  REDIS_PORT: getNumber('REDIS_PORT'),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', false),
  REDIS_DB: getNumber('REDIS_DB'),
  GROQ_API_KEY: getEnv('GROQ_API_KEY'),
  CORS_ORIGIN: getEnv('CORS_ORIGIN', false) || 'http://localhost:3000',
};
