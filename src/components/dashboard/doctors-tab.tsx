
"use client"

import { useState, useEffect } from "react"
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
import { X } from "lucide-react"

interface DoctorsTabProps {
  searchTerm: string;
}

export function DoctorsTab({ searchTerm: globalSearchTerm }: DoctorsTabProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const specialties = [...new Set(mockDoctors.map((d) => d.specialty))]

  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);


  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(localSearchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty !== "all"
      ? doctor.specialty === selectedSpecialty
      : true
    return matchesSearch && matchesSpecialty
  })

  const handleClearFilters = () => {
    setLocalSearchTerm("")
    setSelectedSpecialty("all")
  }

  const showClearButton = localSearchTerm || selectedSpecialty !== "all"

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="بحث عن طبيب..."
          className="max-w-sm"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب التخصص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التخصصات</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showClearButton && (
          <Button variant="ghost" onClick={handleClearFilters}>
            <X className="ml-2 h-4 w-4" />
            مسح
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDoctors.map((doctor) => (
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
                  <CardTitle>د. {doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                أقرب موعد: {doctor.nextAvailable}
              </p>
              <div className="flex items-center gap-2 mt-2">
                 <span className={`h-2 w-2 rounded-full ${doctor.isAvailableToday ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                 <span className="text-xs">{doctor.isAvailableToday ? 'متاح اليوم' : 'غير متاح اليوم'}</span>
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
