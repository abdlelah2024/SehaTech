
"use client"
import { Users, CalendarPlus, Stethoscope, Activity, Wifi, Circle, Database, CheckCircle, XCircle } from "lucide-react"
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
import { mockDoctors, mockPatients, mockTransactions, mockAppointments, mockUsers } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPatientInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import type { Appointment, User } from "@/lib/types"
import { LocalizedDateTime } from "../localized-date-time"
import { format, isToday } from "date-fns"


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

const userStatuses = [
  { status: 'online', label: 'متصل', color: 'bg-green-500' },
  { status: 'offline', label: 'غير متصل', color: 'bg-gray-400' },
  { status: 'inactive', label: 'غير نشط', color: 'bg-yellow-500' },
];

// Mock user statuses for demonstration
const usersWithStatus: (User & { connectionStatus: 'online' | 'offline' | 'inactive' })[] = mockUsers.map((user, index) => ({
  ...user,
  connectionStatus: index % 3 === 0 ? 'online' : index % 3 === 1 ? 'offline' : 'inactive',
}));


export function Overview() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");

  const totalPatients = mockPatients.length;
  const activeDoctors = mockDoctors.filter(d => d.isAvailableToday).length;
  const newAppointments = mockAppointments.filter(a => a.status === 'Scheduled').length;
  const totalRevenue = mockTransactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  const todaysAppointments = useMemo(() => {
    return mockAppointments.filter(appointment => isToday(new Date(appointment.dateTime)));
  }, []);

  const filteredAppointments = useMemo(() => {
    return todaysAppointments.filter(appointment =>
      (filterStatus === 'all' || appointment.status === filterStatus) &&
      (filterDoctor === 'all' || appointment.doctorId === filterDoctor)
    );
  }, [todaysAppointments, filterStatus, filterDoctor]);
  
  const getStatusBadge = (status: Appointment['status']) => {
     switch (status) {
        case 'Completed': return 'success';
        case 'Scheduled': return 'secondary';
        case 'Waiting': return 'waiting';
        case 'Follow-up': return 'followup';
        default: return 'default';
      }
  }
  
  const getUserStatus = (status: 'online' | 'offline' | 'inactive') => {
      const statusInfo = userStatuses.find(s => s.status === status);
      return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusInfo?.color}`}></span>
            <span>{statusInfo?.label}</span>
        </div>
      )
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الإيرادات
            </CardTitle>
             <span className="text-muted-foreground">﷼</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('ar-EG')} ﷼</div>
            <p className="text-xs text-muted-foreground">
              +20.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المرضى
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي سجلات المرضى
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مواعيد اليوم</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              مواعيد مجدولة لهذا اليوم
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
            <div className="text-2xl font-bold">+{activeDoctors}</div>
            <p className="text-xs text-muted-foreground">
              المتاحون اليوم
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        <CardTitle>مواعيد اليوم</CardTitle>
                        <CardDescription>عرض جميع مواعيد اليوم مع إمكانية الفلترة.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                         <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="تصفية حسب الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل الحالات</SelectItem>
                                {Object.entries(statusTranslations).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                     </div>
                </div>
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
                            {filteredAppointments.length > 0 ? filteredAppointments.map((appointment) => (
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
                                    <Badge variant={getStatusBadge(appointment.status)}>
                                        {statusTranslations[appointment.status]}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    لا توجد مواعيد اليوم تطابق معايير البحث.
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
                    <CardTitle>المستخدمون المتصلون</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {usersWithStatus.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(user.name)}`} data-ai-hint="person avatar" />
                                        <AvatarFallback>{getPatientInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                {getUserStatus(user.connectionStatus)}
                            </div>
                        ))}
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
