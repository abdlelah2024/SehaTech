
"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { mockPatients, mockDoctors } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import type { Appointment, Patient, Doctor } from "@/lib/types"

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
  const { toast } = useToast()

  const [newPatientName, setNewPatientName] = useState("")
  const [newPatientDob, setNewPatientDob] = useState<Date | undefined>()
  const [newPatientPhone, setNewPatientPhone] = useState("")
  const [newPatientAddress, setNewPatientAddress] = useState("")
  
  useEffect(() => {
    setSelectedDoctorId(doctorId);
  }, [doctorId]);

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
        resetAndClose();
    }
  }

  const handleCreatePatient = () => {
    if (!newPatientName || !newPatientPhone || !newPatientDob) {
       toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول المطلوبة (الاسم، الهاتف، تاريخ الميلاد).",
      });
      return;
    }

    if (onPatientCreated) {
        const newPatient: Patient = {
            id: `patient-${Date.now()}`,
            name: newPatientName,
            dob: format(newPatientDob, "yyyy-MM-dd"),
            gender: 'آخر',
            phone: newPatientPhone,
            address: newPatientAddress,
            avatarUrl: `https://placehold.co/40x40.png?text=${getPatientInitials(newPatientName)}`
        };
        onPatientCreated(newPatient);
        toast({
            title: "تم إنشاء ملف المريض!",
            description: `تم إنشاء ملف لـ ${newPatientName}.`,
        });
        resetAndClose();
    }
  }

  const getButtonText = () => {
    if (context === 'new-patient') return 'مريض جديد';
    if (doctorId) return 'حجز موعد';
    return 'موعد جديد';
  }
  
  const getPatientInitials = (name: string) => {
    const names = name.split(" ")
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0]?.[0] || ""
  }
  
  const resetAndClose = () => {
    setNewPatientName("");
    setNewPatientDob(undefined);
    setNewPatientPhone("");
    setNewPatientAddress("");
    setSelectedPatientId(undefined);
    setSelectedDoctorId(doctorId);
    setDate(new Date());
    setOpen(false);
  }


  const isNewPatientFlow = context === 'new-patient';
  
  const isDoctorSelectionDisabled = !!doctorId;


  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetAndClose(); else setOpen(true);}}>
      <DialogTrigger asChild>
        <Button>{getButtonText()}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNewPatientFlow ? 'إنشاء ملف مريض جديد' : 'حجز موعد جديد'}</DialogTitle>
          <DialogDescription>
             {isNewPatientFlow
                ? "أدخل البيانات أدناه لإنشاء سجل مريض جديد."
                : "أدخل البيانات أدناه لحجز موعد جديد."}
          </DialogDescription>
        </DialogHeader>

        {isNewPatientFlow ? (
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pl-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
              <Input id="name" placeholder="مثال: أحمد علي" className="col-span-3" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">الهاتف</Label>
              <Input id="phone" type="tel" placeholder="777xxxxxx" className="col-span-3" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} />
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
              <Label htmlFor="address" className="text-right">العنوان</Label>
              <Input id="address" placeholder="صنعاء، شارع تعز" className="col-span-3" value={newPatientAddress} onChange={(e) => setNewPatientAddress(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pl-4">
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
                  <SelectValue placeholder={isDoctorSelectionDisabled ? `د. ${mockDoctors.find(d => d.id === doctorId)?.name}` : "اختر طبيباً"} />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctors.map(d => <SelectItem key={d.id} value={d.id}>د. {d.name} ({d.specialty})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                التاريخ والوقت
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPPPp", { locale: ar }) : <span>اختر تاريخاً ووقتاً</span>}
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
                  <div className="p-2 border-t">
                    <Input type="time" defaultValue={format(date || new Date(), "HH:mm")} onChange={(e) => {
                       const newDate = new Date(date || new Date());
                       const [hours, minutes] = e.target.value.split(':');
                       newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                       setDate(newDate);
                    }}/>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                ملاحظات
              </Label>
              <Textarea id="notes" placeholder="اكتب أي ملاحظات إضافية للطبيب..." className="col-span-3" />
            </div>
          </div>
        )}

        <DialogFooter>
           <Button variant="secondary" onClick={resetAndClose}>إلغاء</Button>
          <Button onClick={isNewPatientFlow ? handleCreatePatient : handleConfirmAppointment}>
            {isNewPatientFlow ? 'إنشاء المريض' : 'تأكيد الموعد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
