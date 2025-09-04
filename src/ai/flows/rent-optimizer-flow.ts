/**
 * @fileoverview This file defines the AI flow for the Rent Advisor feature.
 *
 * It includes the Zod schemas for input and output, the prompt for the
 * generative model, and the main flow function that orchestrates the
 * AI-powered rent analysis.
 *
 * - suggestRent: An async wrapper function that invokes the Genkit flow.
 */
'use server';

import {ai} from '@/ai/genkit';
import {
  RentAdvisorInputSchema,
  RentAdvisorOutputSchema,
  type RentAdvisorInput,
  type RentAdvisorOutput,
} from '@/ai/schemas/rent-optimizer-schemas';

export async function suggestRent(input: RentAdvisorInput): Promise<RentAdvisorOutput> {
  return rentAdvisorFlow(input);
}

const rentAdvisorPrompt = ai.definePrompt({
  name: 'rentAdvisorPrompt',
  input: {schema: RentAdvisorInputSchema},
  output: {schema: RentAdvisorOutputSchema},
  prompt: `You are a real estate market expert specializing in rental properties in India.
Your task is to analyze the provided room details and suggest an optimal monthly rent.

Room Details:
- Location: {{neighborhood}}, {{city}}
- Capacity: {{capacity}} tenant(s)
- Current Rent: {{currentRent}}
- Amenities: {{#each amenities}}- {{this}}\n{{/each}}

Based on this information, provide a suggested rent price.
Your analysis should be concise (2-3 sentences) and justify your suggestion based on the provided details and general market conditions for the area.
Provide a confidence score for your suggestion.`,
});

const rentAdvisorFlow = ai.defineFlow(
  {
    name: 'rentAdvisorFlow',
    inputSchema: RentAdvisorInputSchema,
    outputSchema: RentAdvisorOutputSchema,
  },
  async input => {
    const {output} = await rentAdvisorPrompt(input);
    return output!;
  }
);
