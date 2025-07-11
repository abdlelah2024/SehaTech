"use client"
import { DollarSign, Users, CalendarPlus, Stethoscope, Activity } from "lucide-react"
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
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              All-time patient records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Appointments</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Doctors
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeDoctors}</div>
            <p className="text-xs text-muted-foreground">
              Available today
            </p>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
          <CardHeader>
            <CardTitle>Featured Doctors</CardTitle>
            <CardDescription>Our top-rated and available doctors.</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
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
                            <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                            <CardDescription>{doctor.specialty}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardFooter>
                           <p className="text-xs text-muted-foreground">
                            Next Available: {doctor.nextAvailable}
                          </p>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>An overview of the latest activities in the system.</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                 <Avatar className="h-9 w-9">
                  <AvatarImage src={`/avatars/${activity.actor.toLowerCase().replace(' ', '-')}.png`} data-ai-hint="person avatar" />
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
