import { groq } from '../config/groq';
// import { openai } from 'openai';
import logger from '@/config/logger';
import AppError from '@/utils/appError';

export interface ReviewResult {
  quality: {
    score: number;
    issues: string[];
  };
  security: {
    vulenrabilities: string[];
    severity: 'low' | 'medium' | 'high';
  };
  formatting: {
    issues: string[];
  };
  summary: string;
}

export const openaiService = {
  async reviewCode(code: string, language: string): Promise<ReviewResult> {
    logger.info(`Reviewing code with groqAI for language: ${language}`);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a senior software engineer doing a thorough code review.
          Analyze the submitted code and return ONLY a JSON object with this exact structure:
          {
            "quality": {
              "score": <number between 0 and 10>,
              "issues": [<string describing each quality issue>]
            },
            "security": {
              "vulnerabilities": [<string describing each vulnerability>],
              "severity": <"low" or "medium" or "high">
            },
            "formatting": {
              "issues": [<string describing each formatting issue>]
            },
            "summary": "<2-3 sentence overall review>"
          }
          Be specific and actionable. Reference actual line content where possible.
          If there are no issues in a category return an empty array.`,
        },
        {
          role: 'user',
          content: `Please review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      logger.warn('Groq returned empty response');
      throw new AppError('Groq returned empty response', 500);
    }

    logger.info('GroqAI review completed successfully');

    return JSON.parse(content) as ReviewResult;
  },
};
// export const OpenAiService = {
//   async reviewCode(code: string, language: string): Promise<ReviewResult> {
//     logger.info(`Reviewing code with OpenAI for language: ${language}`);
//
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4o',
//       response_format: { type: 'json_object' }, // forces JSON response
//       messages: [
//         {
//           role: 'system',
//           content: `You are a senior software engineer doing a thorough code review.
//           Analyze the submitted code and return ONLY a JSON object with this exact structure:
//           {
//             "quality": {
//               "score": <number between 0 and 10>,
//               "issues": [<string describing each quality issue>]
//             },
//             "security": {
//               "vulnerabilities": [<string describing each vulnerability>],
//               "severity": <"low" or "medium" or "high">
//             },
//             "formatting": {
//               "issues": [<string describing each formatting issue>]
//             },
//             "summary": "<2-3 sentence overall review>"
//           }
//           Be specific and actionable. Reference actual line content where possible.
//           If there are no issues in a category return an empty array.`,
//         },
//         {
//           role: 'user',
//           content: `Please review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
//         },
//       ],
//     });
//
//     const content = response.choices[0].message.content;
//
//     if (!content) {
//       logger.error('OpenAI response has no content');
//       throw new AppError('Failed to review code', 500);
//     }
//     const result = JSON.parse(content) as ReviewResult;
//
//     logger.info('OpenAI review completed successfully');
//
//     return result;
//   },
// };
