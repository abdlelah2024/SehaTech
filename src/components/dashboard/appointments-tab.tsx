

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
import { mockAppointments, mockDoctors } from "@/lib/mock-data"
import { AppointmentScheduler } from "../appointment-scheduler"
import type { Appointment } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, X, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { LocalizedDateTime } from "../localized-date-time"
import { useToast } from "@/hooks/use-toast"

interface AppointmentsTabProps {
  // searchTerm removed as it's now handled locally
}

const appointmentStatuses = ['Scheduled', 'Waiting', 'Completed', 'Follow-up'];
const statusTranslations: { [key: string]: string } = {
  'Scheduled': 'مجدول',
  'Waiting': 'في الانتظار',
  'Completed': 'مكتمل',
  'Follow-up': 'إعادة'
};

const statusBadgeVariants: { [key: string]: "success" | "secondary" | "waiting" | "followup" } = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Waiting': 'waiting',
    'Follow-up': 'followup'
};


export function AppointmentsTab({ }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const { toast } = useToast()

  const handleAppointmentCreated = (newAppointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
        ...newAppointmentData,
        id: `appt-${Date.now()}`,
        status: 'Scheduled',
    };

    setAppointments(prev => [newAppointment, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate(undefined);
    setFilterStatus("all");
    setFilterDoctor("all");
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
    toast({
        title: "تم تحديث الحالة",
        description: `تم تحديث حالة الموعد إلى "${statusTranslations[newStatus]}".`
    })
  };


  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment =>
      (appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || appointment.status === filterStatus) &&
      (filterDoctor === 'all' || appointment.doctorId === filterDoctor) &&
      (!filterDate || isSameDay(new Date(appointment.dateTime), filterDate))
    );
  }, [appointments, searchTerm, filterStatus, filterDoctor, filterDate]);

  return (
    <Card>
       <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <CardTitle>المواعيد</CardTitle>
                <CardDescription>إدارة وعرض جميع مواعيد المرضى.</CardDescription>
            </div>
            <AppointmentScheduler onAppointmentCreated={handleAppointmentCreated} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto flex-grow">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                  type="search"
                  placeholder="ابحث عن مريض أو طبيب..."
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {filterDate ? format(filterDate, "PPP", { locale: ar }) : <span>تصفية حسب التاريخ</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>

               <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {appointmentStatuses.map(status => (
                    <SelectItem key={status} value={status}>{statusTranslations[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

               <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="تصفية حسب الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأطباء</SelectItem>
                  {mockDoctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>د. {doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(searchTerm || filterDate || filterStatus !== 'all' || filterDoctor !== 'all') && (
                <Button variant="ghost" onClick={handleClearFilters}>
                  مسح الفلاتر
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>
        </CardHeader>
      <CardContent>
        <div className="border rounded-md">
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
              {filteredAppointments.length > 0 ? filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                   <TableCell>{appointment.patientName}</TableCell>
                   <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>{appointment.doctorSpecialty}</TableCell>
                  <TableCell>
                    <LocalizedDateTime dateTime={appointment.dateTime} options={{ dateStyle: 'short', timeStyle: 'short' }} />
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-28 justify-center">
                                 <Badge variant={statusBadgeVariants[appointment.status]} className="w-full justify-center">
                                  {statusTranslations[appointment.status]}
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>تغيير حالة الموعد</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup 
                                value={appointment.status} 
                                onValueChange={(newStatus) => handleStatusChange(appointment.id, newStatus as Appointment['status'])}
                            >
                            {appointmentStatuses.map(status => (
                                <DropdownMenuRadioItem key={status} value={status}>
                                {statusTranslations[status]}
                                </DropdownMenuRadioItem>
                            ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    لا توجد مواعيد تطابق معايير البحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
