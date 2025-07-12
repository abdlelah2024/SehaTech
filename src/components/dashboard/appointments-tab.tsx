
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface AppointmentsTabProps {
  searchTerm: string;
}

const appointmentStatuses = ['Scheduled', 'Waiting', 'Completed', 'Follow-up'];
const statusTranslations: { [key: string]: string } = {
  'Scheduled': 'مجدول',
  'Waiting': 'في الانتظار',
  'Completed': 'مكتمل',
  'Follow-up': 'عودة'
};

export function AppointmentsTab({ searchTerm }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");

  const handleAppointmentCreated = (newAppointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
        ...newAppointmentData,
        id: `appt-${Date.now()}`,
        status: 'Scheduled',
    };

    setAppointments(prev => [newAppointment, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
  };
  
  const handleClearFilters = () => {
    setFilterDate(undefined);
    setFilterStatus("all");
    setFilterDoctor("all");
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
          <div className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>المواعيد</CardTitle>
                <CardDescription>إدارة وعرض جميع مواعيد المرضى.</CardDescription>
            </div>
            <AppointmentScheduler onAppointmentCreated={handleAppointmentCreated} />
          </div>
          <div className="flex items-center gap-2 pt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-right font-normal",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
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
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="تصفية حسب الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأطباء</SelectItem>
                  {mockDoctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>د. {doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(filterDate || filterStatus !== 'all' || filterDoctor !== 'all') && (
                <Button variant="ghost" onClick={handleClearFilters}>
                  <X className="ml-2 h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
          </div>
        </CardHeader>
      <CardContent>
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
                <TableCell>{new Date(appointment.dateTime).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                <TableCell>
                   <Badge variant={
                     appointment.status === 'Completed' ? 'success' :
                     appointment.status === 'Scheduled' ? 'secondary' :
                     appointment.status === 'Waiting' ? 'waiting' :
                     'followup'
                   }>
                    {statusTranslations[appointment.status]}
                  </Badge>
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
      </CardContent>
    </Card>
  )
}
