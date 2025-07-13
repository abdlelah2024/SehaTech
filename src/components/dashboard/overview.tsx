
"use client"
import { Users, CalendarPlus, Stethoscope, Activity, Wifi, Circle, Database, CheckCircle, XCircle, UserPlus, FileText, X } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { mockDoctors, mockPatients, mockTransactions, mockAppointments, mockUsers } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPatientInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import type { Appointment, User, Transaction, Patient } from "@/lib/types"
import { LocalizedDateTime } from "../localized-date-time"
import { format, isToday, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import type { DateRange } from "react-day-picker"
import { useToast } from "@/hooks/use-toast"

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

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

const userStatuses = [
  { status: 'online', label: 'متصل', color: 'bg-green-500' },
  { status: 'offline', label: 'غير متصل', color: 'bg-gray-400' },
  { status: 'inactive', label: 'غير نشط', color: 'bg-yellow-500' },
];

const usersWithStatus: (User & { connectionStatus: 'online' | 'offline' | 'inactive' })[] = mockUsers.map((user, index) => ({
  ...user,
  connectionStatus: index % 3 === 0 ? 'online' : index % 3 === 1 ? 'offline' : 'inactive',
}));

const appointmentStatuses = ['Scheduled', 'Waiting', 'Completed', 'Follow-up'];


export function Overview() {
  const [appointmentsState, setAppointmentsState] = useState<Appointment[]>(mockAppointments);
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointmentsState(prev =>
      prev.map(appt =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
    toast({
        title: "تم تحديث الحالة",
        description: `تم تحديث حالة الموعد إلى "${statusTranslations[newStatus]}".`
    })
  };

  const filteredData = useMemo(() => {
    const today = new Date();
    const interval = filterDateRange?.from && filterDateRange?.to
      ? { start: startOfDay(filterDateRange.from), end: endOfDay(filterDateRange.to) }
      : { start: startOfDay(today), end: endOfDay(today) };

    const appointments = appointmentsState.filter(appointment => {
      const appointmentDate = parseISO(appointment.dateTime);
      const inDateRange = isWithinInterval(appointmentDate, interval);
      const matchesDoctor = filterDoctor === 'all' || appointment.doctorId === filterDoctor;
      return inDateRange && matchesDoctor;
    });

    const transactions = mockTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      const inDateRange = isWithinInterval(transactionDate, interval);
      return inDateRange;
    });

    const patients = mockPatients.filter(patient => {
        const firstAppointment = mockAppointments
            .filter(a => a.patientId === patient.id)
            .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
        if (firstAppointment) {
            return isWithinInterval(parseISO(firstAppointment.dateTime), interval);
        }
        return false;
    });
    
    const doctorAppointmentsCount = mockDoctors.map(doctor => {
        const count = appointmentsState.filter(a => {
             const appointmentDate = parseISO(a.dateTime);
             const inDateRange = isWithinInterval(appointmentDate, interval);
             return a.doctorId === doctor.id && inDateRange;
        }).length;
        return { name: doctor.name, count };
    }).sort((a, b) => b.count - a.count);


    const totalRevenue = transactions
      .filter(t => t.status === 'Success')
      .reduce((sum, t) => sum + t.amount, 0);

    return { appointments, transactions, patients, totalRevenue, doctorAppointmentsCount };
  }, [filterDoctor, filterDateRange, appointmentsState]);

  const appointmentsToday = useMemo(() => {
    return appointmentsState
        .filter(a => isToday(parseISO(a.dateTime)))
        .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [appointmentsState]);

  
  const getUserStatus = (status: 'online' | 'offline' | 'inactive') => {
      const statusInfo = userStatuses.find(s => s.status === status);
      return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusInfo?.color}`}></span>
            <span>{statusInfo?.label}</span>
        </div>
      )
  }
  
  const handleClearFilters = () => {
    setFilterDoctor("all");
    setFilterDateRange(undefined);
  }

  return (
    <div className="mt-4 space-y-6">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
         <div className="flex-1">
            <h1 className="text-2xl font-bold">نظرة عامة</h1>
            <p className="text-muted-foreground">تابع أداء مركزك وإحصائياته الحيوية.</p>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
             <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="تصفية حسب الطبيب" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">كل الأطباء</SelectItem>
                    {mockDoctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>د. {doctor.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[280px] justify-start text-right font-normal">
                     <CalendarPlus className="ml-2 h-4 w-4" />
                     {filterDateRange?.from ? (
                      filterDateRange.to ? (
                        <>
                          {format(filterDateRange.from, "LLL dd, y")} -{" "}
                          {format(filterDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filterDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>اختر نطاق التاريخ (اليوم افتراضيًا)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filterDateRange?.from}
                        selected={filterDateRange}
                        onSelect={setFilterDateRange}
                        numberOfMonths={2}
                        locale={ar}
                    />
                </PopoverContent>
            </Popover>
            {(filterDoctor !== 'all' || filterDateRange) && (
              <Button variant="ghost" onClick={handleClearFilters}>
                  مسح الفلاتر
                  <X className="mr-2 h-4 w-4"/>
              </Button>
            )}
         </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الإيرادات
            </CardTitle>
             <span className="text-muted-foreground">﷼</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.totalRevenue.toLocaleString('ar-EG')} ﷼</div>
            <p className="text-xs text-muted-foreground">
              ضمن الفترة المحددة
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{filteredData.appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              ضمن الفترة المحددة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              المرضى الجدد
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{filteredData.patients.length}</div>
            <p className="text-xs text-muted-foreground">
              مرضى جدد في الفترة المحددة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الأطباء النشطون
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockDoctors.length}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي الأطباء في النظام
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>مواعيد اليوم</CardTitle>
                <CardDescription>
                  قائمة بجميع المواعيد المجدولة لهذا اليوم.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>المريض</TableHead>
                                <TableHead>الطبيب</TableHead>
                                <TableHead>الوقت</TableHead>
                                <TableHead>الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointmentsToday.length > 0 ? 
                             appointmentsToday.map((appointment) => (
                                <TableRow key={appointment.id}>
                                <TableCell>
                                    <div className="font-medium">{appointment.patientName}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {mockPatients.find(p => p.id === appointment.patientId)?.phone}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{appointment.doctorName}</div>
                                    <div className="text-xs text-muted-foreground">{appointment.doctorSpecialty}</div>
                                </TableCell>
                                <TableCell>
                                    <LocalizedDateTime dateTime={appointment.dateTime} options={{ timeStyle: 'short', hour12: true }} />
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
                                <TableCell colSpan={4} className="h-24 text-center">
                                    لا توجد مواعيد لهذا اليوم.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>أداء الأطباء</CardTitle>
                     <CardDescription>عدد المواعيد لكل طبيب في الفترة المحددة.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredData.doctorAppointmentsCount.map(doc => (
                            <div key={doc.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(`د. ${doc.name}`)}`} data-ai-hint="doctor portrait" />
                                        <AvatarFallback>{getPatientInitials(`د. ${doc.name}`)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">د. {doc.name}</p>
                                    </div>
                                </div>
                                <div className="font-semibold">{doc.count} موعد</div>
                            </div>
                        ))}
                         {filteredData.doctorAppointmentsCount.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات لعرضها حسب الفلاتر المحددة.</p>
                         )}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>حالة النظام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Wifi className="h-5 w-5 text-muted-foreground"/>
                             <span>مزامنة البيانات</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                           <CheckCircle className="h-5 w-5" />
                           <span>متصل</span>
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Database className="h-5 w-5 text-muted-foreground"/>
                             <span>قاعدة البيانات الخارجية</span>
                        </div>
                         <div className="flex items-center gap-2 text-green-600">
                           <CheckCircle className="h-5 w-5" />
                           <span>متصل</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
       </div>
    </div>
  )
}
