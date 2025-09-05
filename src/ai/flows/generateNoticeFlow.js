
'use server';
/**
 * @fileOverview An AI flow for generating professional tenant notices.
 *
 * - generateNotice - A function that takes a simple prompt and returns a structured notice.
 * - GenerateNoticeInput - The input type for the generateNotice function.
 * - GenerateNoticeOutput - The return type for the generateNotice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

/**
 * @typedef {z.infer<typeof GenerateNoticeInputSchema>} GenerateNoticeInput
 */
const GenerateNoticeInputSchema = z.string();

/**
 * @typedef {z.infer<typeof GenerateNoticeOutputSchema>} GenerateNoticeOutput
 */
const GenerateNoticeOutputSchema = z.object({
  title: z.string().describe('A clear, concise title for the notice.'),
  message: z
    .string()
    .describe(
      'A professionally written, polite, and detailed message for the notice. It should be formatted with newlines for readability. Ensure it is written from the perspective of a property manager.'
    ),
});


const prompt = ai.definePrompt({
  name: 'generateNoticePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: z.string().describe('The user\'s simple instruction for the notice content.')},
  output: {schema: GenerateNoticeOutputSchema},
  prompt: `You are an expert property manager. Your task is to write a clear, professional, and polite notice for tenants based on a simple instruction.

The instruction is: {{{prompt}}}

Generate a suitable title and a detailed message for the notice board. Ensure the tone is formal and courteous. Add details where appropriate to make the message clear. For example, if a time is mentioned, specify AM/PM. Sign off as "Management".`,
});

const generateNoticeFlow = ai.defineFlow(
  {
    name: 'generateNoticeFlow',
    inputSchema: z.string(),
    outputSchema: GenerateNoticeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output;
  }
);


/**
 * @param {GenerateNoticeInput} input
 * @returns {Promise<GenerateNoticeOutput>}
 */
export async function generateNotice(
  input
) {
  return generateNoticeFlow(input);
}
