

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
import { UserPlus, Search } from "lucide-react"

interface PatientsTabProps {
  // No props needed as search is local
}

export function PatientsTab({ }: PatientsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>(() => [...mockPatients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  
  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
    // Optionally select the newly created patient
    setSelectedPatient(newPatient);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm))
    )
  }, [patients, searchTerm]);

  const getPatientAppointmentCount = (patientId: string) => {
    return mockAppointments.filter(
      (appointment) => appointment.patientId === patientId
    ).length
  }

  const getPrefilledData = () => {
     const isPhone = /^\d+$/.test(searchTerm);
     return isPhone ? { phone: searchTerm } : { name: searchTerm };
  }

  return (
    <>
      <Card>
        <CardHeader>
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <div>
                <CardTitle>سجلات المرضى</CardTitle>
                <CardDescription>
                  ابحث بالاسم أو رقم الهاتف للوصول السريع للملفات أو لإضافة مريض جديد.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                 <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  className="w-full sm:w-[300px] pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
           </div>
        </CardHeader>
        <CardContent>
          {searchTerm && filteredPatients.length === 0 ? (
                <Card className="text-center py-10">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                            <UserPlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">لم يتم العثور على المريض</CardTitle>
                        <CardDescription>
                           هل تريد إضافة "{searchTerm}" كمريض جديد في النظام؟
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <AppointmentScheduler 
                            context="new-patient" 
                            onPatientCreated={handlePatientCreated}
                            prefilledData={getPrefilledData()}
                         />
                    </CardContent>
                </Card>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المريض</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">إجمالي المواعيد</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar>
                               <AvatarImage src={patient.avatarUrl} data-ai-hint="person avatar" />
                              <AvatarFallback>{getPatientInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="hidden sm:table-cell">{getPatientAppointmentCount(patient.id)}</TableCell>
                        <TableCell className="text-center">
                           <div className="flex items-center justify-center gap-2">
                             <AppointmentScheduler onAppointmentCreated={() => {}} doctorId={undefined} selectedPatientId={patient.id} />
                             <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>عرض الملف</Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                              {searchTerm ? "لا يوجد مرضى يطابقون معايير البحث." : "ابدأ البحث عن طريق كتابة اسم أو رقم هاتف المريض."}
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )
          }
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
