'use server';
/**
 * @fileOverview Implements an AI flow to summarize a patient's history.
 *
 * - summarizePatientHistory - A function that generates a clinical summary for a patient.
 * - SummarizePatientHistoryInput - The input type for the summarizePatientHistory function.
 * - SummarizePatientHistoryOutput - The return type for the summarizePatientHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePatientHistoryInputSchema = z.object({
  patient: z.object({
    name: z.string().describe("The patient's full name."),
    dob: z.string().describe("The patient's date of birth."),
    gender: z.string().describe("The patient's gender."),
  }),
  appointments: z.array(
    z.object({
      doctorName: z.string().describe("The doctor's name."),
      doctorSpecialty: z.string().describe("The doctor's specialty."),
      dateTime: z.string().describe("The date and time of the appointment."),
      status: z.string().describe("The status of the appointment (e.g., Completed, Scheduled)."),
    })
  ).describe("The patient's appointment history."),
});
export type SummarizePatientHistoryInput = z.infer<typeof SummarizePatientHistoryInputSchema>;

const SummarizePatientHistoryOutputSchema = z.object({
  summary: z.string().describe("A concise clinical summary of the patient's history, highlighting key information like recent visits, upcoming appointments, and specialties of doctors seen. Should be in paragraph form."),
});
export type SummarizePatientHistoryOutput = z.infer<typeof SummarizePatientHistoryOutputSchema>;


export async function summarizePatientHistory(input: SummarizePatientHistoryInput): Promise<SummarizePatientHistoryOutput> {
  return summarizePatientHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePatientHistoryPrompt',
  input: {schema: SummarizePatientHistoryInputSchema},
  output: {schema: SummarizePatientHistoryOutputSchema},
  prompt: `You are a helpful clinical assistant. Your task is to generate a concise summary of a patient's record.
  The summary should be easy to read for a clinician, highlighting the most important information.

  Patient Information:
  - Name: {{{patient.name}}}
  - Date of Birth: {{{patient.dob}}}
  - Gender: {{{patient.gender}}}

  Appointment History:
  {{#each appointments}}
  - {{dateTime}}: Appointment with {{doctorName}} ({{doctorSpecialty}}). Status: {{status}}.
  {{/each}}

  Based on the data provided, generate a clinical summary. Focus on the frequency of visits, the range of specialties they have seen, and any upcoming scheduled appointments.
  Provide the output as a single paragraph.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const summarizePatientHistoryFlow = ai.defineFlow(
  {
    name: 'summarizePatientHistoryFlow',
    inputSchema: SummarizePatientHistoryInputSchema,
    outputSchema: SummarizePatientHistoryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
