
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
import { ar } from "date-fns/locale"
import { mockPatients, mockDoctors } from "@/lib/mock-data"
import { suggestSlotsAction } from "@/lib/actions"
import type { SuggestOptimalAppointmentSlotsOutput } from "@/ai/flows/suggest-optimal-appointment-slots"
import { useToast } from "@/hooks/use-toast"
import type { Appointment, Patient } from "@/lib/types"

interface AppointmentSchedulerProps {
  doctorId?: string;
  onAppointmentCreated?: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  onPatientCreated?: (patient: Patient) => void;
  context?: 'new-patient' | 'new-appointment';
}


export function AppointmentScheduler({ doctorId, onAppointmentCreated, onPatientCreated, context = 'new-appointment' }: AppointmentSchedulerProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>()
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestOptimalAppointmentSlotsOutput['suggestedSlots']>()
  const { toast } = useToast()

  const [newPatientName, setNewPatientName] = useState("")
  const [newPatientEmail, setNewPatientEmail] = useState("")
  const [newPatientDob, setNewPatientDob] = useState<Date | undefined>()
  const [newPatientPhone, setNewPatientPhone] = useState("")
  const [newPatientAddress, setNewPatientAddress] = useState("")


  const handleGetSuggestions = async () => {
    if (!selectedDoctorId) {
       toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء اختيار طبيب أولاً.",
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
          title: "لا توجد اقتراحات",
          description: "لا يمكن اقتراح أوقات مثلى في هذا الوقت.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ بالذكاء الاصطناعي",
        description: "لا يمكن الحصول على الاقتراحات. يرجى المحاولة مرة أخرى.",
      })
      console.error(error);
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSuggestionClick = (slot: { date: string, time: string }) => {
    const [year, month, day] = slot.date.split('-').map(Number);
    const [hours, minutes] = slot.time.split(':').map(Number);
    setDate(new Date(year, month - 1, day, hours, minutes));
    setSuggestions(undefined);
  }

  const handleConfirmAppointment = () => {
    if (!selectedPatientId || !selectedDoctorId || !date) {
      toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "الرجاء اختيار المريض، الطبيب، والتاريخ.",
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
            doctorName: `د. ${doctor.name}`,
            doctorSpecialty: doctor.specialty,
            dateTime: date.toISOString(),
        });
        toast({
            title: "تم حجز الموعد!",
            description: `تم حجز موعد لـ ${patient.name} مع د. ${doctor.name}.`,
        });
        setOpen(false);
    }
  }

  const handleCreatePatient = () => {
    if (!newPatientName || !newPatientEmail || !newPatientDob) {
       toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، تاريخ الميلاد).",
      });
      return;
    }

    if (onPatientCreated) {
        const newPatient: Patient = {
            id: `patient-${Date.now()}`,
            name: newPatientName,
            email: newPatientEmail,
            dob: format(newPatientDob, "yyyy-MM-dd"),
            gender: 'آخر',
            phone: newPatientPhone,
            address: newPatientAddress,
        };
        onPatientCreated(newPatient);
        toast({
            title: "تم إنشاء ملف المريض!",
            description: `تم إنشاء ملف لـ ${newPatientName}.`,
        });

        setNewPatientName("");
        setNewPatientEmail("");
        setNewPatientDob(undefined);
        setNewPatientPhone("");
        setNewPatientAddress("");
        setOpen(false);
    }
  }

  const getButtonText = () => {
    if (context === 'new-patient') return 'مريض جديد';
    if (doctorId) return 'حجز موعد';
    return 'موعد جديد';
  }

  const isNewPatientFlow = context === 'new-patient';
  const isDoctorSelectionDisabled = !selectedPatientId && !doctorId;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">{getButtonText()}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewPatientFlow ? 'إنشاء ملف مريض جديد' : 'حجز موعد جديد'}</DialogTitle>
          <DialogDescription>
             {isNewPatientFlow
                ? "أدخل البيانات أدناه لإنشاء سجل مريض جديد."
                : "أدخل البيانات أدناه لحجز موعد جديد."}
          </DialogDescription>
        </DialogHeader>

        {isNewPatientFlow ? (
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
              <Input id="name" placeholder="مثال: أحمد علي" className="col-span-3" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="email@example.com" className="col-span-3" value={newPatientEmail} onChange={(e) => setNewPatientEmail(e.target.value)} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dob" className="text-right">تاريخ الميلاد</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-right font-normal",
                        !newPatientDob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newPatientDob ? format(newPatientDob, "PPP", { locale: ar }) : <span>اختر تاريخاً</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newPatientDob}
                      onSelect={setNewPatientDob}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1930}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">الهاتف</Label>
              <Input id="phone" type="tel" placeholder="777xxxxxx" className="col-span-3" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">العنوان</Label>
              <Input id="address" placeholder="صنعاء، شارع تعز" className="col-span-3" value={newPatientAddress} onChange={(e) => setNewPatientAddress(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                المريض
              </Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient" className="col-span-3">
                  <SelectValue placeholder="اختر مريضاً" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                الطبيب
              </Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} disabled={isDoctorSelectionDisabled}>
                <SelectTrigger id="doctor" className="col-span-3">
                  <SelectValue placeholder="اختر طبيباً" />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctors.map(d => <SelectItem key={d.id} value={d.id}>د. {d.name} ({d.specialty})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                التاريخ
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-right font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {date ? format(date, "PPP HH:mm", { locale: ar }) : <span>اختر تاريخاً ووقتاً</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ar}
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
                  اقتراح موعد مثالي بالذكاء الاصطناعي
                </Button>
              </div>
            </div>
            {suggestions && (
              <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">الاقتراحات</Label>
                  <div className="col-span-3 space-y-2">
                      {suggestions.map((slot, index) => (
                          <div key={index} className="p-2 border rounded-md">
                              <Button variant="link" className="p-0 h-auto" onClick={() => handleSuggestionClick(slot)}>
                                  {format(new Date(slot.date), 'EEE، d MMM', { locale: ar })} الساعة {slot.time}
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">{slot.reason}</p>
                          </div>
                      ))}
                  </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                ملاحظات
              </Label>
              <Textarea id="notes" placeholder="اكتب أي ملاحظات إضافية للطبيب..." className="col-span-3" />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={isNewPatientFlow ? handleCreatePatient : handleConfirmAppointment}>
            {isNewPatientFlow ? 'إنشاء المريض' : 'تأكيد الموعد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
