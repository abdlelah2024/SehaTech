
"use client"

import { useState, useMemo } from "react"
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
import { mockAppointments } from "@/lib/mock-data"
import { AppointmentScheduler } from "../appointment-scheduler"
import type { Appointment } from "@/lib/types"

interface AppointmentsTabProps {
  searchTerm: string;
}

export function AppointmentsTab({ searchTerm }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const handleAppointmentCreated = (newAppointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
        ...newAppointmentData,
        id: `appt-${Date.now()}`,
        status: 'Scheduled',
    };

    setAppointments(prev => [newAppointment, ...prev]);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);


  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المواعيد</CardTitle>
            <CardDescription>إدارة وعرض جميع مواعيد المرضى.</CardDescription>
          </div>
          <AppointmentScheduler onAppointmentCreated={handleAppointmentCreated} />
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المريض</TableHead>
              <TableHead>الطبيب</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>التاريخ والوقت</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patientName}</TableCell>
                <TableCell>{appointment.doctorName}</TableCell>
                <TableCell>{appointment.doctorSpecialty}</TableCell>
                <TableCell>{new Date(appointment.dateTime).toLocaleString('ar-EG')}</TableCell>
                <TableCell>
                   <Badge variant={
                     appointment.status === 'Completed' ? 'success' :
                     appointment.status === 'Scheduled' ? 'secondary' :
                     appointment.status === 'Waiting' ? 'waiting' :
                     'followup'
                   }>
                    {
                      appointment.status === 'Completed' ? 'مكتمل' :
                      appointment.status === 'Scheduled' ? 'مجدول' :
                      appointment.status === 'Waiting' ? 'في الانتظار' :
                      'عودة'
                    }
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
