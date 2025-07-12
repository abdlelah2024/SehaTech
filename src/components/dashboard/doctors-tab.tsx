
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
import { X, Calendar, Edit, Trash2, Repeat } from "lucide-react"
import { AddDoctorDialog } from "./add-doctor-dialog"
import { EditDoctorDialog } from "./edit-doctor-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Doctor } from "@/lib/types"

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


interface DoctorsTabProps {
  searchTerm: string;
}

export function DoctorsTab({ searchTerm: globalSearchTerm }: DoctorsTabProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const { toast } = useToast();
  
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

  const handleDoctorUpdated = (updatedDoctor: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
    setDoctorToEdit(null);
  };
  
  const handleDoctorDeleted = (doctorId: string) => {
     setDoctors(prev => prev.filter(d => d.id !== doctorId));
     toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف ملف الطبيب من النظام.",
     });
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
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={doctor.image}
                      alt={`د. ${doctor.name}`}
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
                   <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDoctorToEdit(doctor)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                             <Trash2 className="h-4 w-4" />
                             <span className="sr-only">حذف</span>
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف ملف الطبيب بشكل دائم من خوادمنا.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDoctorDeleted(doctor.id)} className="bg-destructive hover:bg-destructive/90">
                              نعم، قم بالحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-lg">﷼</span>
                 <span>سعر الكشفية: {doctor.servicePrice?.toLocaleString('ar-EG') ?? 'غير محدد'}</span>
               </div>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                 <span>عودة مجانية: {doctor.freeReturnDays ?? 'غير محدد'} أيام</span>
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

       {doctorToEdit && (
        <EditDoctorDialog
          isOpen={!!doctorToEdit}
          onClose={() => setDoctorToEdit(null)}
          doctor={doctorToEdit}
          onDoctorUpdated={handleDoctorUpdated}
        />
      )}
    </div>
  )
}
