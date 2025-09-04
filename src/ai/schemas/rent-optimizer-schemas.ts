/**
 * @fileoverview This file defines the Zod schemas for the Rent Advisor feature.
 *
 * - RentAdvisorInputSchema: The Zod schema for the input data (room details).
 * - RentAdvisorInput: The TypeScript type inferred from the input schema.
 * - RentAdvisorOutputSchema: The Zod schema for the AI's response.
 * - RentAdvisorOutput: The TypeScript type inferred from the output schema.
 */
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
