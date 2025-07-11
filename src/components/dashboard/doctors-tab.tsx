
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
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const specialties = [...new Set(mockDoctors.map((d) => d.specialty))]

  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);


  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(localSearchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty
      ? doctor.specialty === selectedSpecialty
      : true
    return matchesSearch && matchesSpecialty
  })

  const handleClearFilters = () => {
    setLocalSearchTerm("")
    setSelectedSpecialty("")
  }

  const showClearButton = localSearchTerm || selectedSpecialty

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search doctors..."
          className="max-w-sm"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showClearButton && (
          <Button variant="ghost" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
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
