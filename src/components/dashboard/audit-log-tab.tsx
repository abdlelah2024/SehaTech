
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
import {
  Card,
  CardContent,
  CardDescription,
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
import { mockAuditLogs, mockUsers } from "@/lib/mock-data"
import type { AuditLog, UserRole } from "@/lib/types"
import { Badge } from "../ui/badge"
import { Search, X } from "lucide-react"
import { LocalizedDateTime } from "../localized-date-time"

const roleTranslations: { [key in UserRole]: string } = {
  admin: 'مدير',
  receptionist: 'موظف استقبال',
  doctor: 'طبيب',
};

export function AuditLogTab() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");

  const sections = useMemo(() => [...new Set(logs.map(log => log.section))], [logs]);
  const roles = useMemo(() => [...new Set(logs.map(log => log.userRole))], [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log =>
      (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.action.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === 'all' || log.userRole === filterRole) &&
      (filterSection === 'all' || log.section === filterSection)
    );
  }, [logs, searchTerm, filterRole, filterSection]);
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterSection("all");
  };

  const showClearButton = searchTerm || filterRole !== 'all' || filterSection !== 'all';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>سجل التغييرات</CardTitle>
            <CardDescription>مراقبة جميع الأنشطة والإجراءات التي تتم في النظام.</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث عن مستخدم أو إجراء..."
              className="w-full appearance-none bg-background pr-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="تصفية حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأدوار</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{roleTranslations[role]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="تصفية حسب القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              {sections.map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showClearButton && (
            <Button variant="ghost" onClick={handleClearFilters}>
              مسح الفلاتر
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الإجراء</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>الوقت والتاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.userRole === 'admin' ? 'destructive' :
                      log.userRole === 'doctor' ? 'secondary' : 'default'
                    }>
                      {roleTranslations[log.userRole]}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.section}</TableCell>
                  <TableCell>
                    <LocalizedDateTime dateTime={log.timestamp} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    لا توجد سجلات تطابق معايير البحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
