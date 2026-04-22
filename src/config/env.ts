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
};
