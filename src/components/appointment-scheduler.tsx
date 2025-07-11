
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { mockPatients, mockDoctors } from "@/lib/mock-data"
import { suggestSlotsAction } from "@/lib/actions"
import type { SuggestOptimalAppointmentSlotsOutput } from "@/ai/flows/suggest-optimal-appointment-slots"
import { useToast } from "@/hooks/use-toast"
import type { Appointment } from "@/lib/types"

interface AppointmentSchedulerProps {
  doctorId?: string;
  onAppointmentCreated?: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
}


export function AppointmentScheduler({ doctorId, onAppointmentCreated }: AppointmentSchedulerProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>()
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestOptimalAppointmentSlotsOutput['suggestedSlots']>()
  const { toast } = useToast()

  const handleGetSuggestions = async () => {
    if (!selectedDoctorId) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a doctor first.",
      })
      return;
    }
    setIsLoadingSuggestions(true)
    setSuggestions(undefined);
    try {
      const result = await suggestSlotsAction({ doctorId: selectedDoctorId, patientId: selectedPatientId || 'patient-1' });
      if (result.suggestedSlots.length > 0) {
        setSuggestions(result.suggestedSlots);
      } else {
        toast({
          title: "No Suggestions",
          description: "No optimal slots could be suggested at this time.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get suggestions. Please try again.",
      })
      console.error(error);
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSuggestionClick = (slot: { date: string, time: string }) => {
    const [year, month, day] = slot.date.split('-').map(Number);
    const [hours, minutes] = slot.time.split(':').map(Number);
    // Note: JS month is 0-indexed
    setDate(new Date(year, month - 1, day, hours, minutes));
    setSuggestions(undefined); // Clear suggestions after selection
  }

  const handleConfirmAppointment = () => {
    if (!selectedPatientId || !selectedDoctorId || !date) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a patient, doctor, and date.",
      });
      return;
    }

    const patient = mockPatients.find(p => p.id === selectedPatientId);
    const doctor = mockDoctors.find(d => d.id === selectedDoctorId);

    if (patient && doctor && onAppointmentCreated) {
        onAppointmentCreated({
            patientId: patient.id,
            patientName: patient.name,
            doctorId: doctor.id,
            doctorName: `Dr. ${doctor.name}`,
            doctorSpecialty: doctor.specialty,
            dateTime: date.toISOString(),
        });
        toast({
            title: "Appointment Scheduled!",
            description: `Scheduled for ${patient.name} with Dr. ${doctor.name}.`,
        });
        setOpen(false); // Close dialog on success
    }
  }


  const doctor = mockDoctors.find(d => d.id === selectedDoctorId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">{doctorId ? 'Book Appointment' : 'New Appointment'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details below to book a new appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="patient" className="text-right">
              Patient
            </Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger id="patient" className="col-span-3">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doctor" className="text-right">
              Doctor
            </Label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger id="doctor" className="col-span-3">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map(d => <SelectItem key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP HH:mm") : <span>Pick a date and time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3">
              <Button variant="ghost" onClick={handleGetSuggestions} disabled={isLoadingSuggestions || !selectedDoctorId || !selectedPatientId} className="w-full justify-start gap-2 text-primary hover:text-primary disabled:text-muted-foreground disabled:no-underline">
                {isLoadingSuggestions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Suggest optimal slot with AI
              </Button>
            </div>
          </div>
          {suggestions && (
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Suggestions</Label>
                <div className="col-span-3 space-y-2">
                    {suggestions.map((slot, index) => (
                        <div key={index} className="p-2 border rounded-md">
                            <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick(slot)}>
                                {format(new Date(slot.date), 'EEE, MMM d')} at {slot.time}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">{slot.reason}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea id="notes" placeholder="Any additional notes for the doctor..." className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirmAppointment}>Confirm Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
