
"use client"

import { useState, useMemo, useEffect } from "react"
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

  useEffect(() => {
    // Sync local search with global search if it changes
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.includes(localSearchTerm))
    )
  }, [patients, localSearchTerm]);

  const getPatientAppointmentCount = (patientId: string) => {
    return mockAppointments.filter(
      (appointment) => appointment.patientId === patientId
    ).length
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المرضى</CardTitle>
            <CardDescription>
              عرض وإدارة جميع سجلات المرضى.
            </CardDescription>
          </div>
           <AppointmentScheduler context="new-patient" onPatientCreated={handlePatientCreated} />
        </CardHeader>
        <CardContent>
           <div className="mb-4">
             <Input
              placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
              className="max-w-full"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المريض</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="hidden md:table-cell">الهاتف</TableHead>
                  <TableHead className="hidden sm:table-cell">إجمالي المواعيد</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                  <TableRow key={patient.id} onClick={() => setSelectedPatient(patient)} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                           <AvatarImage src={patient.avatarUrl} data-ai-hint="person avatar" />
                          <AvatarFallback>{getPatientInitials(patient.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{patient.phone}</TableCell>
                    <TableCell className="hidden sm:table-cell">{getPatientAppointmentCount(patient.id)}</TableCell>
                    <TableCell className="text-left">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }}>عرض الملف</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          لا يوجد مرضى يطابقون معايير البحث.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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

    