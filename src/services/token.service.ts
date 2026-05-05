import { encoding_for_model } from 'tiktoken';
import logger from '@/config/logger';

export const TokenService = {
  count(code: string): number {
    try {
      const encoder = encoding_for_model('gpt-4o');
      const tokens = encoder.encode(code);
      const tokenCount = tokens.length;

      logger.info('code token count', { tokenCount });

      return tokenCount;
    } catch (err) {
      logger.error('Token counting failed', { err });
      return Math.ceil(code.length / 4);
    }
  },
};
