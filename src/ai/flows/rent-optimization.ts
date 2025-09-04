'use server';
/**
 * @fileOverview AI-powered rent optimization flow.
 *
 * - suggestOptimalRent - A function that suggests the optimal rent for a property.
 * - RentOptimizationInput - The input type for the suggestOptimalRent function.
 * - RentOptimizationOutput - The output type for the suggestOptimalRent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RentOptimizationInputSchema = z.object({
  location: z.string().describe('The location of the property.'),
  size: z.string().describe('The size of the property (e.g., number of bedrooms, square footage).'),
  amenities: z.string().describe('A list of amenities offered by the property.'),
  marketRatesDescription: z.string().describe('Description of market rates for comparable properties.'),
});
export type RentOptimizationInput = z.infer<typeof RentOptimizationInputSchema>;

const RentOptimizationOutputSchema = z.object({
  suggestedRent: z.number().describe('The suggested optimal rent price for the property.'),
  reasoning: z.string().describe('The reasoning behind the suggested rent price.'),
});
export type RentOptimizationOutput = z.infer<typeof RentOptimizationOutputSchema>;

export async function suggestOptimalRent(input: RentOptimizationInput): Promise<RentOptimizationOutput> {
  return rentOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rentOptimizationPrompt',
  input: {schema: RentOptimizationInputSchema},
  output: {schema: RentOptimizationOutputSchema},
  prompt: `You are an expert real estate analyst specializing in rent optimization.

Given the following information about a property, suggest an optimal monthly rent price.

Location: {{{location}}}
Size: {{{size}}}
Amenities: {{{amenities}}}
Market Rates: {{{marketRatesDescription}}}

Consider all factors and provide a suggested rent price along with a brief explanation of your reasoning.

Output the suggested rent as a number, and reasoning as a string.`,
});

const rentOptimizationFlow = ai.defineFlow(
  {
    name: 'rentOptimizationFlow',
    inputSchema: RentOptimizationInputSchema,
    outputSchema: RentOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

