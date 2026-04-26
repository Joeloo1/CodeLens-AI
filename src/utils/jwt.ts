import jwt from 'jsonwebtoken';
import { config } from '@/config/env';

export const generateToken = (payload: string | object) => {
  const secret = config.JWT_SECRET;
  //   const expiresIn = config.JWT_EXPIRES_IN;
  const options = {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions;

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string) => {
  const secret = config.JWT_SECRET;
  return jwt.verify(token, secret);
};
