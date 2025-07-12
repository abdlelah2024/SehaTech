
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
import { useToast } from "@/hooks/use-toast"
import { mockUsers } from "@/lib/mock-data"
import type { User, UserRole } from "@/lib/types"
import { Badge } from "../ui/badge"

interface UsersTabProps {
  searchTerm: string;
}

const roleTranslations: { [key in UserRole]: string } = {
  admin: 'مدير',
  receptionist: 'موظف استقبال',
  doctor: 'طبيب',
};

export function UsersTab({ searchTerm }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    
    resetDialog();
  };
  
  const resetDialog = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("receptionist");
    setIsDialogOpen(false);
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>المستخدمين والصلاحيات</CardTitle>
          <CardDescription>إدارة حسابات المستخدمين وأدوارهم في النظام.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (isOpen) { resetDialog(); setIsDialogOpen(true); } else { setIsDialogOpen(false); } }}>
          <DialogTrigger asChild>
            <Button>إضافة مستخدم جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
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
              <Button onClick={handleAddUser}>إضافة المستخدم</Button>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
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
                <TableCell>
                  <Button variant="outline" size="sm">تعديل</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
