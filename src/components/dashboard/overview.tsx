
"use client"
import { Users, CalendarPlus, Stethoscope, Activity } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { mockDoctors, mockPatients, mockRecentActivities, mockTransactions, mockAppointments } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPatientInitials } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

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


export function Overview() {
  const totalPatients = mockPatients.length;
  const activeDoctors = mockDoctors.filter(d => d.isAvailableToday).length;
  const newAppointments = mockAppointments.filter(a => a.status === 'Scheduled').length;
  const totalRevenue = mockTransactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mt-4">
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
              سجلات المرضى على الإطلاق
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المواعيد الجديدة</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +19% من الشهر الماضي
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
              متاحون اليوم
            </p>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
          <CardHeader>
            <CardTitle>الأطباء المميزون</CardTitle>
            <CardDescription>الأطباء الأعلى تقييماً والمتاحون.</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                direction: "rtl",
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {mockDoctors.map((doctor) => (
                  <CarouselItem key={doctor.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardHeader className="flex-row gap-4 items-center">
                           <Image
                            src={doctor.image}
                            alt={`Dr. ${doctor.name}`}
                            width={60}
                            height={60}
                            className="rounded-full"
                            data-ai-hint="doctor portrait"
                          />
                          <div>
                            <CardTitle className="text-lg">د. {doctor.name}</CardTitle>
                            <CardDescription>{doctor.specialty}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            أقرب موعد: {doctor.nextAvailable}
                          </p>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="right-[-1rem] -translate-x-0" />
              <CarouselNext className="left-[-1rem] -translate-x-0"/>
            </Carousel>
          </CardContent>
        </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>النشاط الأخير</CardTitle>
              <CardDescription>نظرة عامة على أحدث الأنشطة في النظام.</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                 <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(activity.actor)}`} data-ai-hint="person avatar" />
                  <AvatarFallback>{getPatientInitials(activity.actor)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.actor}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
