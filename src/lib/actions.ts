
"use server"

import {
  summarizePatientHistory,
  type SummarizePatientHistoryInput,
} from "@/ai/flows/summarize-patient-history"
import {
  suggestOptimalAppointmentSlots,
  type SuggestOptimalAppointmentSlotsInput,
} from "@/ai/flows/suggest-optimal-appointment-slots"
import {
  suggestBillingService,
  type SuggestBillingServiceInput,
} from "@/ai/flows/suggest-billing-service"
import { mockAppointments, mockDoctors } from "./mock-data"
import type { Patient } from "./types"

export async function suggestSlotsAction(
  input: Pick<SuggestOptimalAppointmentSlotsInput, "patientId" | "doctorId">
) {
  const { patientId, doctorId } = input

  const doctor = mockDoctors.find((d) => d.id === doctorId)
  if (!doctor) {
    throw new Error("Doctor not found")
  }

  const appointmentHistory = mockAppointments
    .filter((a) => a.patientId === patientId && a.doctorId === doctorId)
    .map((a) => {
      const d = new Date(a.dateTime)
      return {
        date: d.toISOString().split("T")[0],
        time: d.toTimeString().split(" ")[0].substring(0, 5),
      }
    })

  const aiInput: SuggestOptimalAppointmentSlotsInput = {
    patientId,
    doctorId,
    appointmentHistory,
    doctorAvailability: doctor.availability,
  }

  try {
    const suggestions = await suggestOptimalAppointmentSlots(aiInput)
    return suggestions
  } catch (error) {
    console.error("Error calling GenAI flow:", error)
    // In a real app, you'd want more robust error handling
    return { suggestedSlots: [] }
  }
}

export async function getPatientSummaryAction(patient: Patient) {
  const patientAppointments = mockAppointments
    .filter((appointment) => appointment.patientId === patient.id)
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    )
    .map((a) => ({
      doctorName: a.doctorName,
      doctorSpecialty: a.doctorSpecialty,
      dateTime: new Date(a.dateTime).toLocaleString('ar-EG'),
      status: a.status,
    }))

  const aiInput: SummarizePatientHistoryInput = {
    patient: {
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
    },
    appointments: patientAppointments,
  }

  try {
    const result = await summarizePatientHistory(aiInput)
    return result.summary
  } catch (error) {
    console.error("Error getting patient summary:", error)
    throw new Error("Failed to generate patient summary.")
  }
}


export async function suggestServiceAction(
  input: Pick<SuggestBillingServiceInput, "patientId">
) {
  const { patientId } = input;

  const recentAppointments = mockAppointments
    .filter((a) => a.patientId === patientId)
    .sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5) // Get the 5 most recent appointments
    .map(a => ({
      doctorSpecialty: a.doctorSpecialty,
      dateTime: a.dateTime,
      status: a.status
    }));

  if (recentAppointments.length === 0) {
    return { service: "" };
  }

  const aiInput: SuggestBillingServiceInput = {
    patientId,
    recentAppointments,
  };

  try {
    const result = await suggestBillingService(aiInput);
    return result;
  } catch (error) {
    console.error("Error suggesting billing service:", error);
    throw new Error("Failed to suggest billing service.");
  }
}
