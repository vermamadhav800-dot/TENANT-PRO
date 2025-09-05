
/**
 * @fileoverview This file initializes and configures the Genkit AI functionality.
 * It sets up the Google AI plugin and exports a configured Genkit instance.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The plugin is configured using environment variables (e.g., GEMINI_API_KEY).
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Log errors to the console.
  logSinks: ['googleCloud'],
  // Prevent browser logs from being sent to the server.
  enableTracing: true,
});
