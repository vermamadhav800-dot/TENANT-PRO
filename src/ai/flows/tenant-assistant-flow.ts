
'use server';

/**
 * @fileOverview A helpful AI assistant for tenants.
 * 
 * - askTenantAssistant - A function that handles tenant queries.
 * - TenantAssistantInput - The input type for the askTenantAssistant function.
 * - TenantAssistantOutput - The return type for the askTenantAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define Zod schemas for complex objects first
const TenantDataSchema = z.object({
  name: z.string().describe('The name of the tenant.'),
  unitNo: z.string().describe('The room or unit number of the tenant.'),
  rentAmount: z.number().describe('The base rent amount for the tenant.'),
  dueDate: z.string().optional().describe('The ISO string for the rent due date.'),
  leaseStartDate: z.string().optional().describe('The ISO string for the lease start date.'),
  leaseEndDate: z.string().optional().describe('The ISO string for the lease end date.'),
});

const PropertyDataSchema = z.object({
  propertyName: z.string().describe("The name of the property."),
  propertyAddress: z.string().describe("The address of the property."),
  upiId: z.string().optional().describe("The UPI ID for making payments."),
});

// Define the main input schema for the flow
export const TenantAssistantInputSchema = z.object({
  query: z.string().describe("The tenant's question or query."),
  tenantData: TenantDataSchema.describe("The data specific to the querying tenant."),
  propertyData: PropertyDataSchema.describe("General data about the property."),
  ownerName: z.string().describe("The name of the property owner or manager."),
});
export type TenantAssistantInput = z.infer<typeof TenantAssistantInputSchema>;
export type TenantAssistantOutput = string;

export async function askTenantAssistant(input: TenantAssistantInput): Promise<TenantAssistantOutput> {
  return tenantAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tenantAssistantPrompt',
  input: { schema: TenantAssistantInputSchema },
  output: { schema: z.string() },
  prompt: `You are a friendly and helpful AI Assistant for tenants of a property called '{{propertyData.propertyName}}'.
Your name is 'Flow'. You are designed to assist tenants with their questions regarding their stay.
The property manager's name is {{ownerName}}.

You are speaking with a tenant named {{tenantData.name}}.
Here is their information:
- Room Number: {{tenantData.unitNo}}
- Base Rent: ₹{{tenantData.rentAmount}} per month
- Rent Due Date: {{tenantData.dueDate}}
- Lease Starts: {{tenantData.leaseStartDate}}
- Lease Ends: {{tenantData.leaseEndDate}}

Here is the property's information:
- Property Name: {{propertyData.propertyName}}
- Property Address: {{propertyData.propertyAddress}}
- UPI ID for payments: {{propertyData.upiId}}

Your primary responsibilities are:
1.  Answer tenant questions clearly and concisely based ONLY on the information provided above.
2.  Help them understand how to use the app (e.g., "To pay rent, go to the 'Rent & Payments' tab and click 'Pay Amount Due'").
3.  Be polite, professional, and friendly in all your responses.

IMPORTANT RULES:
- DO NOT answer questions that are not related to the property, the tenant's lease, rent, or the app's functionality.
- If asked an off-topic question (e.g., "What is the capital of France?"), you MUST politely decline. Say something like, "I can only answer questions related to your tenancy at {{propertyData.propertyName}}."
- Do not make up information. If you don't know the answer, say "I don't have that information. You may need to contact the property manager, {{ownerName}}, directly."
- Keep your answers short and to the point.

Tenant's question is:
"{{{query}}}"`,
});

const tenantAssistantFlow = ai.defineFlow(
  {
    name: 'tenantAssistantFlow',
    inputSchema: TenantAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await prompt(input);
    return text;
  }
);
