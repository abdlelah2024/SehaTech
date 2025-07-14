
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
import { Separator } from "../ui/separator"
import { Trash2 } from "lucide-react"

// Mock data for form fields. In a real app, this would come from a config or database.
const formFieldsConfig = {
  addDoctor: [
    { id: 'servicePrice', label: 'سعر الكشفية', required: false },
    { id: 'freeReturnDays', label: 'إعادة مجانية (أيام)', required: false },
    { id: 'availableDays', label: 'أيام الدوام', required: true },
  ],
  addPatient: [
    { id: 'dob', label: 'تاريخ الميلاد', required: true },
    { id: 'address', label: 'العنوان', required: false },
  ],
  newAppointment: [
    { id: 'notes', label: 'ملاحظات الموعد', required: false },
  ]
};

type FormKey = keyof typeof formFieldsConfig;


export function SettingsTab() {
  const { toast } = useToast()

  // Mock state for settings
  const [clinicName, setClinicName] = useState("مركز صحة تك الطبي")
  const [clinicAddress, setClinicAddress] = useState("صنعاء، شارع الخمسين")
  const [clinicPhone, setClinicPhone] = useState("01-555-555")
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [followUpNotifications, setFollowUpNotifications] = useState(false)
  const [billingCurrency, setBillingCurrency] = useState("YER")
  const [selectedForm, setSelectedForm] = useState<FormKey>('addDoctor');

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
  
  const handleFieldRequirementChange = (fieldId: string, required: boolean) => {
    // This is a mock function. In a real app, you would update the database.
    console.log(`Setting field ${fieldId} in form ${selectedForm} to required=${required}`);
     toast({
      title: `تم تحديث الحقل`,
      description: `تم تغيير متطلبات الحقل بنجاح (محاكاة).`,
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
          <CardTitle>إدارة حقول النماذج</CardTitle>
          <CardDescription>
            تحكم في الحقول المطلوبة والاختيارية في نماذج الإدخال المختلفة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
              <Label htmlFor="form-select">اختر النموذج للتعديل</Label>
               <Select value={selectedForm} onValueChange={(value) => setSelectedForm(value as FormKey)}>
                <SelectTrigger id="form-select" className="w-full md:w-[280px]">
                  <SelectValue placeholder="اختر نموذجًا" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addDoctor">نموذج إضافة طبيب</SelectItem>
                  <SelectItem value="addPatient">نموذج إضافة مريض</SelectItem>
                  <SelectItem value="newAppointment">نموذج المواعيد الجديدة</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <Separator className="my-4" />
            <div className="space-y-4">
                {formFieldsConfig[selectedForm].map(field => (
                  <div key={field.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.id} className="text-base">{field.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {field.required ? 'هذا الحقل مطلوب حاليًا.' : 'هذا الحقل اختياري حاليًا.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          id={field.id}
                          checked={field.required}
                          onCheckedChange={(checked) => handleFieldRequirementChange(field.id, checked)}
                        />
                        <Label htmlFor={field.id}>مطلوب</Label>
                      </div>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                         <Trash2 className="h-4 w-4" />
                         <span className="sr-only">حذف القاعدة</span>
                       </Button>
                    </div>
                  </div>
                ))}
            </div>

        </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button>إضافة حقل جديد (قيد التطوير)</Button>
        </CardFooter>
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
            <Button onClick={handleSaveChanges}>حفظ كل الإعدادات</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

    