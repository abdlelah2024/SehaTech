
"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Trash2, Edit, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import type { User, UserRole } from "@/lib/types"
import { Badge } from "../ui/badge"
import { EditUserDialog } from "./edit-user-dialog"
import { db, auth } from "@/lib/firebase"
import { collection, onSnapshot, query, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { usePermissions } from "@/hooks/use-permissions"
import { useAuthState } from "react-firebase-hooks/auth"

const roleTranslations: { [key in UserRole]: string } = {
  admin: 'مدير',
  receptionist: 'موظف استقبال',
  doctor: 'طبيب',
};

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

  // User Management State
  const [authUser] = useAuthState(auth);
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("receptionist")
  
  const permissions = usePermissions(users.find(u => u.id === authUser?.uid)?.role || 'receptionist');

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSaveChanges = () => {
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
    console.log(`Setting field ${fieldId} in form ${selectedForm} to required=${required}`);
     toast({
      title: `تم تحديث الحقل`,
      description: `تم تغيير متطلبات الحقل بنجاح (محاكاة).`,
    })
  }
  
  const handleAddUser = async () => {
    if (!name || !email || !role || !password) {
      toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول.",
      });
      return;
    }
    
    try {
      await addDoc(collection(db, "users"), { name, email, role, createdAt: serverTimestamp() });
      
      toast({
        title: "تمت إضافة المستخدم بنجاح (محاكاة)",
        description: `تمت إضافة ${name} إلى قاعدة البيانات. تأكد من إنشائه في نظام المصادقة بكلمة المرور المحددة.`,
      });
      resetAddDialog();
    } catch(e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "خطأ", description: "فشلت إضافة المستخدم."});
    }
  };

  const resetAddDialog = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("receptionist");
    setIsAddDialogOpen(false);
  }

  const handleUserUpdated = async (updatedUser: User) => {
    const { id, ...userData } = updatedUser;
    const userRef = doc(db, "users", id);
    try {
        await updateDoc(userRef, userData);
        toast({
          title: "تم تحديث البيانات بنجاح",
          description: `تم تحديث ملف المستخدم ${updatedUser.name}.`,
        });
        setUserToEdit(null);
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث المستخدم."});
    }
  };
  
  const handleUserDeleted = async (userId: string) => {
     try {
       await deleteDoc(doc(db, "users", userId));
       toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف المستخدم من النظام.",
       });
     } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "خطأ", description: "فشل حذف المستخدم."});
     }
  };
  
  if (!permissions?.manageSettings) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>غير مصرح به</CardTitle>
            </CardHeader>
            <CardContent>
                <p>ليس لديك الصلاحية لعرض هذه الصفحة.</p>
            </CardContent>
        </Card>
    )
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
      
       {permissions.manageUsers && (
        <Card>
            <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                <CardTitle>المستخدمون والصلاحيات</CardTitle>
                <CardDescription>إدارة حسابات المستخدمين وأدوارهم في النظام.</CardDescription>
                </div>
                {permissions.addUser && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                    <Button>إضافة مستخدم جديد</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                        <DialogDescription>
                        أدخل بيانات المستخدم.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">الاسم</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="مثال: أحمد علي" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="user@example.com" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="••••••••" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">الدور (الصلاحية)</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="اختر دوراً" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="receptionist">موظف استقبال</SelectItem>
                            <SelectItem value="doctor">طبيب</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetAddDialog}>إلغاء</Button>
                        <Button onClick={handleAddUser}>إضافة المستخدم</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
                )}
            </div>
            <div className="mt-4 relative w-full sm:max-w-xs">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                className="w-full appearance-none bg-background pr-8 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </CardHeader>
            <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'doctor' ? 'secondary' : 'default'
                        }>
                            {roleTranslations[user.role]}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            {permissions.editUser && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setUserToEdit(user)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">تعديل</span>
                                </Button>
                            )}
                            {permissions.deleteUser && (
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
                                        هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المستخدم بشكل دائم.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleUserDeleted(user.id)} className="bg-destructive hover:bg-destructive/90">
                                        نعم، قم بالحذف
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                    <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                لا يوجد مستخدمون يطابقون معايير البحث.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </CardContent>
            {userToEdit && (
                <EditUserDialog
                isOpen={!!userToEdit}
                onClose={() => setUserToEdit(null)}
                user={userToEdit}
                onUserUpdated={handleUserUpdated}
                />
            )}
        </Card>
      )}


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
