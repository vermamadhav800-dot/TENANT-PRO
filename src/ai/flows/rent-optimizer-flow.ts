/**
 * @fileoverview This file defines the AI flow for the Rent Advisor feature.
 *
 * It includes the Zod schemas for input and output, the prompt for the
 * generative model, and the main flow function that orchestrates the
 * AI-powered rent analysis.
 *
 * - suggestRent: An async wrapper function that invokes the Genkit flow.
 * - RentAdvisorInput: The Zod schema for the input data (room details).
 * - RentAdvisorOutput: The Zod schema for the AI's response.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const RentAdvisorInputSchema = z.object({
  capacity: z.number().describe('The maximum number of tenants the room can accommodate.'),
  currentRent: z.number().describe('The current total monthly rent for the room.'),
  city: z.string().describe('The city where the property is located.'),
  neighborhood: z.string().describe('The specific neighborhood or area of the city.'),
  amenities: z.array(z.string()).describe('A list of amenities available for the room or property.'),
});
export type RentAdvisorInput = z.infer<typeof RentAdvisorInputSchema>;

export const RentAdvisorOutputSchema = z.object({
  suggestedRent: z.number().describe('The AI-suggested optimal monthly rent for the room.'),
  analysis: z.string().describe('A detailed analysis explaining the reasoning behind the suggested rent, considering market trends, location, and amenities.'),
  confidenceScore: z.number().describe('A confidence score (from 0 to 1) indicating how confident the AI is in its suggestion.'),
});
export type RentAdvisorOutput = z.infer<typeof RentAdvisorOutputSchema>;

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
