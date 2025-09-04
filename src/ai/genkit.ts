/**
 * @fileoverview This file configures and exports the Genkit AI instance.
 *
 * It sets up the Google AI plugin, which is necessary for integrating
 * Google's generative models into the application. The API key is
 * read from the `GEMINI_API_KEY` environment variable.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
