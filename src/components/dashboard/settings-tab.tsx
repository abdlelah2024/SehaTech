
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function SettingsTab() {
  const { toast } = useToast()

  // Mock state for settings
  const [clinicName, setClinicName] = useState("مركز صحة تك الطبي")
  const [clinicAddress, setClinicAddress] = useState("صنعاء، شارع الخمسين")
  const [clinicPhone, setClinicPhone] = useState("01-555-555")
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [followUpNotifications, setFollowUpNotifications] = useState(false)
  const [billingCurrency, setBillingCurrency] = useState("YER")

  const handleSaveChanges = () => {
    // In a real app, you would save these settings to your database (e.g., Firestore)
    console.log("Saving settings...", {
      clinicName,
      clinicAddress,
      clinicPhone,
      appointmentReminders,
      followUpNotifications,
      billingCurrency,
    })
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعدادات النظام بنجاح.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
          <CardDescription>
            إدارة المعلومات الأساسية وإعدادات النظام لمركزك الطبي.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">اسم المركز الطبي</Label>
            <Input
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">عنوان المركز</Label>
            <Input
              id="clinicAddress"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">رقم هاتف المركز</Label>
            <Input
              id="clinicPhone"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>
            تحكم في الإشعارات التلقائية التي يتم إرسالها للمرضى.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="appointmentReminders" className="text-base">تذكيرات المواعيد</Label>
              <p className="text-sm text-muted-foreground">
                إرسال رسائل تذكير للمرضى قبل مواعيدهم.
              </p>
            </div>
            <Switch
              id="appointmentReminders"
              checked={appointmentReminders}
              onCheckedChange={setAppointmentReminders}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="followUpNotifications" className="text-base">تنبيهات المتابعة</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار للمريض عند حلول موعد إعادة الكشف.
              </p>
            </div>
            <Switch
              id="followUpNotifications"
              checked={followUpNotifications}
              onCheckedChange={setFollowUpNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الإعدادات المالية</CardTitle>
          <CardDescription>
            إدارة إعدادات الفوترة والعملات.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="billingCurrency">عملة الفوترة</Label>
            <Select value={billingCurrency} onValueChange={setBillingCurrency}>
              <SelectTrigger id="billingCurrency" className="w-[180px]">
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges}>حفظ التغييرات</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
