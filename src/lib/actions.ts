"use server"

import {
  summarizePatientHistory,
  type SummarizePatientHistoryInput,
} from "@/ai/flows/summarize-patient-history"
import {
  suggestOptimalAppointmentSlots,
  type SuggestOptimalAppointmentSlotsInput,
} from "@/ai/flows/suggest-optimal-appointment-slots"
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
      dateTime: new Date(a.dateTime).toLocaleString(),
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
