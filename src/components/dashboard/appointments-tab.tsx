
"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockAppointments, mockPatients, mockDoctors } from "@/lib/mock-data"
import { AppointmentScheduler } from "../appointment-scheduler"
import type { Appointment } from "@/lib/types"

export function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const handleAppointmentCreated = (newAppointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
        ...newAppointmentData,
        id: `appt-${Date.now()}`,
        status: 'Scheduled',
    };

    setAppointments(prev => [newAppointment, ...prev]);
  };


  return (
    <Card className="mt-4">
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Manage and view all patient appointments.</CardDescription>
          </div>
          <AppointmentScheduler onAppointmentCreated={handleAppointmentCreated} />
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patientName}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
