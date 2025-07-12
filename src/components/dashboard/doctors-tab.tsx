
"use client"

import { useState, useEffect, useMemo } from "react"
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
import { X, Calendar, DollarSign, Repeat } from "lucide-react"
import { AddDoctorDialog } from "./add-doctor-dialog"
import type { Doctor } from "@/lib/types"

interface DoctorsTabProps {
  searchTerm: string;
}

export function DoctorsTab({ searchTerm: globalSearchTerm }: DoctorsTabProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  
  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  const specialties = useMemo(() => [...new Set(doctors.map((d) => d.specialty))], [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name
        .toLowerCase()
        .includes(localSearchTerm.toLowerCase())
      const matchesSpecialty = selectedSpecialty !== "all"
        ? doctor.specialty === selectedSpecialty
        : true
      return matchesSearch && matchesSpecialty
    })
  }, [doctors, localSearchTerm, selectedSpecialty]);

  const handleClearFilters = () => {
    setLocalSearchTerm("")
    setSelectedSpecialty("all")
  }
  
  const handleDoctorCreated = (newDoctor: Doctor) => {
    setDoctors(prev => [newDoctor, ...prev]);
  };

  const showClearButton = localSearchTerm || selectedSpecialty !== "all"

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
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
        <AddDoctorDialog onDoctorCreated={handleDoctorCreated} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="flex flex-col">
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
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
               <div className="flex items-center gap-2">
                 <DollarSign className="h-4 w-4" />
                 <span>سعر الكشفية: ${doctor.servicePrice?.toFixed(2) ?? 'N/A'}</span>
               </div>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                 <span>عودة مجانية: {doctor.freeReturnDays ?? 'N/A'} أيام</span>
               </div>
               <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1" />
                  <div>
                    <span>أيام الدوام:</span>
                    <p className="text-xs">{doctor.availableDays?.join('، ') ?? 'غير محدد'}</p>
                  </div>
               </div>
            </CardContent>
            <CardFooter>
              <AppointmentScheduler doctorId={doctor.id} />
            </CardFooter>
          </Card>
        ))}
        {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
                لا يوجد أطباء يطابقون معايير البحث.
            </div>
        )}
      </div>
    </div>
  )
}
