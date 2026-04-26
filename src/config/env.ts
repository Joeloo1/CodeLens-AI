import dotenv from 'dotenv';

dotenv.config();

const mustGet = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

export const config = {
  NODE_ENV: mustGet('NODE_ENV'),
  PORT: mustGet('PORT'),
  DATABASE_URL: mustGet('DATABASE_URL'),
  PASSWORD_SALT_ROUNDS: parseInt(mustGet('PASSWORD_SALT_ROUNDS')),
  JWT_SECRET: mustGet('JWT_SECRET'),
  JWT_EXPIRES_IN: mustGet('JWT_EXPIRES_IN'),
};
