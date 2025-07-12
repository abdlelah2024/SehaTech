
"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { mockUsers } from "@/lib/mock-data"
import type { User, UserRole } from "@/lib/types"
import { Badge } from "../ui/badge"
import { EditUserDialog } from "./edit-user-dialog"
import { Edit, Trash2, Search } from "lucide-react"

interface UsersTabProps {
  // searchTerm removed as it's handled locally
}

const roleTranslations: { [key in UserRole]: string } = {
  admin: 'مدير',
  receptionist: 'موظف استقبال',
  doctor: 'طبيب',
};

export function UsersTab({ }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("receptionist")
  const { toast } = useToast()

  const handleAddUser = () => {
    if (!name || !email || !password || !role) {
      toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول.",
      });
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
    };

    setUsers(prev => [newUser, ...prev]);

    toast({
      title: "تمت إضافة المستخدم",
      description: `تمت إضافة ${name} إلى النظام.`,
    });
    
    resetAddDialog();
  };
  
  const resetAddDialog = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("receptionist");
    setIsAddDialogOpen(false);
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setUserToEdit(null);
  };
  
  const handleUserDeleted = (userId: string) => {
     setUsers(prev => prev.filter(u => u.id !== userId));
     toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستخدم من النظام.",
     });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <>
      <Card>
        <CardHeader>
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>المستخدمون والصلاحيات</CardTitle>
              <CardDescription>إدارة حسابات المستخدمين وأدوارهم في النظام.</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>إضافة مستخدم جديد</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                   <DialogDescription>
                    أدخل بيانات المستخدم الجديد وقم بتعيين دور له.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">الاسم</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">الدور</Label>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setUserToEdit(user)}>
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
      </Card>
      {userToEdit && (
        <EditUserDialog
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          user={userToEdit}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </>
  )
}
