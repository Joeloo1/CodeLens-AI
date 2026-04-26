import bcrypt from 'node_modules/bcryptjs';
// import logger from '@/config/logger';
import { config } from '@/config/env';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string) => {
  const saltsRound = config.PASSWORD_SALT_ROUNDS;
  return await bcrypt.hash(password, saltsRound);
};

/**
 * Compare user input password with hashed password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Check if user changed password after token was issued
 */
export const isPasswordChangedAfter = (
  passwordChangedAt: Date | null,
  jwtTimestamp: number,
): boolean => {
  if (!passwordChangedAt) return false;

  const passwordChangedTimestamp = Math.floor(
    passwordChangedAt.getTime() / 1000,
  );
  return passwordChangedTimestamp > jwtTimestamp;
};
