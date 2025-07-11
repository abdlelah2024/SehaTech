import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-patient-history.ts';
import '@/ai/flows/suggest-optimal-appointment-slots.ts';
import '@/ai/flows/suggest-billing-service.ts';
