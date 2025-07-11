import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockAppointments } from "@/lib/mock-data"
import { AppointmentScheduler } from "../appointment-scheduler"

export function AppointmentsTab() {
  return (
    <Card className="mt-4">
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Manage and view all patient appointments.</CardDescription>
          </div>
          <AppointmentScheduler />
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
            {mockAppointments.map((appointment) => (
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
