import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockDoctors } from "@/lib/mock-data"
import Image from "next/image"
import { AppointmentScheduler } from "../appointment-scheduler"

export function DoctorsTab() {
  const specialties = [...new Set(mockDoctors.map(d => d.specialty))];

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-4">
        <Input placeholder="Search doctors..." className="max-w-sm" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockDoctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Image
                  src={doctor.image}
                  alt={`Dr. ${doctor.name}`}
                  width={60}
                  height={60}
                  className="rounded-full"
                  data-ai-hint="doctor portrait"
                />
                <div>
                  <CardTitle>Dr. {doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Next Available: {doctor.nextAvailable}
              </p>
              <div className="flex items-center gap-2 mt-2">
                 <span className={`h-2 w-2 rounded-full ${doctor.isAvailableToday ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                 <span className="text-xs">{doctor.isAvailableToday ? 'Available Today' : 'Unavailable Today'}</span>
              </div>
            </CardContent>
            <CardFooter>
              <AppointmentScheduler doctorId={doctor.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
