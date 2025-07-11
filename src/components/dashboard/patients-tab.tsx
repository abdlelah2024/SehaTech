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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { mockPatients, mockAppointments } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppointmentScheduler } from "../appointment-scheduler"

export function PatientsTab() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPatientInitials = (name: string) => {
    const names = name.split(" ")
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0][0]
  }

  const getPatientAppointmentCount = (patientId: string) => {
    return mockAppointments.filter(
      (appointment) => appointment.patientId === patientId
    ).length
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Patients</CardTitle>
          <CardDescription>
            View and manage all patient records.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search patients..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
           <AppointmentScheduler />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Appointments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(patient.name)}`} data-ai-hint="person avatar" />
                      <AvatarFallback>{getPatientInitials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                </TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{getPatientAppointmentCount(patient.id)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">View Profile</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
