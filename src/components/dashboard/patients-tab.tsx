
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
import { UserPlus } from "lucide-react"

interface PatientsTabProps {
  searchTerm: string;
}

export function PatientsTab({ searchTerm: globalSearchTerm }: PatientsTabProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [schedulerContext, setSchedulerContext] = useState<'new-patient' | 'new-appointment'>('new-appointment');
  const [prefilledData, setPrefilledData] = useState<{name?: string, phone?: string}>({});

  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
    // Optionally select the newly created patient
    setSelectedPatient(newPatient);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(localSearchTerm))
    )
  }, [patients, localSearchTerm]);

  const getPatientAppointmentCount = (patientId: string) => {
    return mockAppointments.filter(
      (appointment) => appointment.patientId === patientId
    ).length
  }

  const handleAddNewPatientClick = () => {
      const isPhone = /^\d+$/.test(localSearchTerm);
      setPrefilledData(isPhone ? { phone: localSearchTerm } : { name: localSearchTerm });
      setSchedulerContext('new-patient');
      setIsSchedulerOpen(true);
  }
  
  const handleNewAppointmentForExistingPatient = (patient: Patient) => {
    // This functionality can be enhanced, for now, we just open the scheduler
    // In a real app you might pass the patient ID to the scheduler
     alert(`Starting new appointment flow for ${patient.name}`);
  }

  return (
    <>
      <Card>
        <CardHeader>
             <div>
                <CardTitle>سجلات المرضى</CardTitle>
                <CardDescription>
                  ابحث بالاسم أو رقم الهاتف للوصول السريع للملفات أو لإضافة مريض جديد.
                </CardDescription>
              </div>
        </CardHeader>
        <CardContent>
           <div className="mb-4 flex gap-4">
             <Input
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="max-w-full"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
             <AppointmentScheduler context="new-patient" onPatientCreated={handlePatientCreated} prefilledData={prefilledData} />
          </div>

          {localSearchTerm && filteredPatients.length === 0 ? (
                <Card className="text-center py-10">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                            <UserPlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">لم يتم العثور على المريض</CardTitle>
                        <CardDescription>
                           هل تريد إضافة "{localSearchTerm}" كمريض جديد في النظام؟
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <AppointmentScheduler 
                            context="new-patient" 
                            onPatientCreated={handlePatientCreated}
                            prefilledData={/^\d+$/.test(localSearchTerm) ? {phone: localSearchTerm} : {name: localSearchTerm}}
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
                              {localSearchTerm ? "لا يوجد مرضى يطابقون معايير البحث." : "ابدا البحث عن طريق كتابة اسم او رقم هاتف المريض."}
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
