
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Download, BarChart2, User, FileText } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const reportTypes = [
  { value: "daily_financial", label: "تقرير مالي يومي", icon: FileText },
  { value: "doctor_activity", label: "تقرير نشاط الأطباء", icon: User },
  { value: "appointment_summary", label: "ملخص المواعيد", icon: BarChart2 },
]

export function ReportsTab() {
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState("daily_financial")
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleExport = () => {
    // This is a placeholder for the actual export functionality.
    // In a real app, this would trigger a download of a CSV or PDF file.
    const reportLabel = reportTypes.find(r => r.value === selectedReport)?.label
    toast({
      title: "جاري تصدير التقرير...",
      description: `سيتم تجهيز "${reportLabel}" للتحميل. (ميزة قيد التطوير)`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء تقرير مخصص</CardTitle>
          <CardDescription>
            اختر نوع التقرير والفترة الزمنية المطلوبة لإنشاء تقريرك.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">نوع التقرير</label>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((report) => (
                  <SelectItem key={report.value} value={report.value}>
                    <div className="flex items-center gap-2">
                      <report.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{report.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">اختر التاريخ</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-right font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ar }) : <span>اختر تاريخًا</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col space-y-2 justify-end">
            <Button onClick={handleExport} className="w-full">
              <Download className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground">
        <p>سيتم عرض معاينة للتقرير هنا. (ميزة قيد التطوير)</p>
      </div>
    </div>
  )
}
