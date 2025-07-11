"use server"

import {
  suggestOptimalAppointmentSlots,
  type SuggestOptimalAppointmentSlotsInput,
} from "@/ai/flows/suggest-optimal-appointment-slots"
import { mockAppointments, mockDoctors } from "./mock-data"

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
