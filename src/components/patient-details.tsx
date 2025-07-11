
"use client"

import { useState, useEffect } from "react"
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
import { mockAppointments, mockTransactions } from "@/lib/mock-data"
import type { Patient, Appointment, Transaction } from "@/lib/types"
import { getPatientInitials } from "@/lib/utils"
import { Separator } from "./ui/separator"
import { Cake, VenetianMask, Phone, Home, Sparkles, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { getPatientSummaryAction } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"

interface PatientDetailsProps {
  patient: Patient
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function PatientDetails({ patient, isOpen, onOpenChange }: PatientDetailsProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const { toast } = useToast()

  const patientAppointments = mockAppointments.filter(
    (appointment) => appointment.patientId === patient.id
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const patientTransactions = mockTransactions.filter(
    (transaction) => transaction.patientId === patient.id
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true)
    setSummary(null)
    try {
      const result = await getPatientSummaryAction(patient)
      setSummary(result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate patient summary. Please try again.",
      })
      console.error(error)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  useEffect(() => {
    // Only generate summary if the dialog is open for a patient
    // and a summary hasn't been generated for them yet in this session.
    if (isOpen && patient && !summary) {
        handleGenerateSummary();
    }
     // Intentionally not adding `summary` to dependency array to cache result
  }, [isOpen, patient]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      // If dialog is closing, clear the summary for next time
      if (!open) {
        setSummary(null);
        setIsLoadingSummary(false);
      }
    }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20">
              <AvatarImage src={`/avatars/${patient.name.replace(' ', '-')}.png`} data-ai-hint="person avatar" />
              <AvatarFallback className="text-2xl">{getPatientInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <DialogDescription>{patient.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-6">
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
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">AI Summary</h3>
                         <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={isLoadingSummary}>
                            {isLoadingSummary ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            <span className="sr-only">Regenerate</span>
                        </Button>
                    </div>
                     <div className="text-sm text-muted-foreground border rounded-md p-3 min-h-[120px] bg-muted/20">
                        {isLoadingSummary && (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[85%]" />
                            </div>
                        )}
                        {summary && <p>{summary}</p>}
                        {!summary && !isLoadingSummary && <p>Click the sparkles to generate an AI-powered summary.</p>}
                     </div>
                </div>
            </div>
            <div className="md:col-span-3 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Appointment History</h3>
                    <div className="max-h-48 overflow-y-auto border rounded-md">
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
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Billing History</h3>
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                           {patientTransactions.length > 0 ? (
                            patientTransactions.map((transaction: Transaction) => (
                            <TableRow key={transaction.id}>
                               <TableCell>{transaction.service}</TableCell>
                               <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                               <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                               <TableCell>
                                 <Badge variant={
                                   transaction.status === 'Success' ? 'success' : 'destructive'
                                 }>
                                  {transaction.status}
                                </Badge>
                               </TableCell>
                            </TableRow>
                           ))) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No transactions found.</TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                      </Table>
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
