
/**
 * @fileOverview This file initializes and configures the Genkit AI toolkit.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version.
      apiVersion: 'v1beta',
    }),
  ],
  // Log to the console in development, but not in production.
  logLevel: process.env.NODE_ENV === 'dev' ? 'debug' : 'info',
  // Omit logs in tests.
  enableTracing: process.env.NODE_ENV !== 'test',
});
