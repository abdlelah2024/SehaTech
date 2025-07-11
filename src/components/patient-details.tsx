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
import { Separator } from "./ui/separator"
import { Cake, VenetianMask, Phone, Home } from "lucide-react"

interface PatientDetailsProps {
  patient: Patient
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function PatientDetails({ patient, isOpen, onOpenChange }: PatientDetailsProps) {
  const patientAppointments = mockAppointments.filter(
    (appointment) => appointment.patientId === patient.id
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://placehold.co/80x80.png?text=${getPatientInitials(patient.name)}`} data-ai-hint="person avatar" />
              <AvatarFallback className="text-2xl">{getPatientInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <DialogDescription>{patient.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                <div className="space-y-3 text-sm">
                   <div className="flex items-center gap-3">
                        <Cake className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.dob} ({getAge(patient.dob)} years old)</span>
                   </div>
                   <div className="flex items-center gap-3">
                        <VenetianMask className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.gender}</span>
                   </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.phone}</span>
                   </div>
                   <div className="flex items-center gap-3">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.address}</span>
                   </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Appointment History</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientAppointments.length > 0 ? (
                        patientAppointments.map((appointment: Appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="font-medium">{appointment.doctorName}</div>
                            <div className="text-xs text-muted-foreground">{appointment.doctorSpecialty}</div>
                          </TableCell>
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
                            <TableCell colSpan={3} className="text-center h-24">No appointments found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
