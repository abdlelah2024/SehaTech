"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockAppointments } from "@/lib/mock-data"
import type { Patient, Appointment } from "@/lib/types"
import { getPatientInitials } from "@/lib/utils"

interface PatientDetailsProps {
  patient: Patient
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function PatientDetails({ patient, isOpen, onOpenChange }: PatientDetailsProps) {
  const patientAppointments = mockAppointments.filter(
    (appointment) => appointment.patientId === patient.id
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://placehold.co/64x64.png?text=${getPatientInitials(patient.name)}`} data-ai-hint="person avatar" />
              <AvatarFallback>{getPatientInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <DialogDescription>{patient.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Appointment History</h3>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientAppointments.length > 0 ? (
                    patientAppointments.map((appointment: Appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.doctorSpecialty}</TableCell>
                      <TableCell>{new Date(appointment.dateTime).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          appointment.status === 'Completed' ? 'success' :
                          appointment.status === 'Scheduled' ? 'secondary' :
                          appointment.status === 'Waiting' ? 'waiting' :
                          'followup'
                        }>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No appointments found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
