
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
import { getPatientInitials } from "@/lib/utils"
import { PatientDetails } from "../patient-details"
import type { Patient } from "@/lib/types"

interface PatientsTabProps {
  searchTerm: string;
}

export function PatientsTab({ searchTerm: globalSearchTerm }: PatientsTabProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>(mockPatients)

  // We are not using globalSearchTerm for now to provide a dedicated search experience
  // useEffect(() => {
  //   setLocalSearchTerm(globalSearchTerm);
  // }, [globalSearchTerm]);

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(localSearchTerm.toLowerCase())
    )
  }, [patients, localSearchTerm]);

  const getPatientAppointmentCount = (patientId: string) => {
    return mockAppointments.filter(
      (appointment) => appointment.patientId === patientId
    ).length
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المرضى</CardTitle>
            <CardDescription>
              عرض وإدارة جميع سجلات المرضى.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="بحث عن مريض..."
              className="max-w-sm"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <AppointmentScheduler context="new-patient" onPatientCreated={handlePatientCreated} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المريض</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>إجمالي المواعيد</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
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
                  <TableCell className="text-left">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>عرض الملف الشخصي</Button>
                  </TableCell>
                </TableRow>
              ))}
               {filteredPatients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        لا يوجد مرضى يطابقون معايير البحث.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPatient && (
         <PatientDetails
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedPatient(null);
            }
          }}
        />
      )}
    </>
  )
}
