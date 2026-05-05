import Groq from 'groq-sdk';
import { config } from '@/config/env';

export const groq = new Groq({
  apiKey: config.GROQ_API_KEY,
});
