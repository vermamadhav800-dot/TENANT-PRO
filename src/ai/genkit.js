
/**
 * @fileOverview This file initializes and a single instance of the Genkit AI toolkit.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is read from the `GEMINI_API_KEY` environment variable.
      apiVersion: 'v1beta',
    }),
  ],
  // Log to the console in development, but not in production.
  logLevel: process.env.NODE_ENV === 'dev' ? 'debug' : 'info',
  // Omit logs in tests.
  enableTracing: process.env.NODE_ENV !== 'test',
});
