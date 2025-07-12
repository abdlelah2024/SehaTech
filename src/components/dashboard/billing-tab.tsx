
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockTransactions, mockPatients, mockAppointments } from "@/lib/mock-data"
import type { Transaction, Patient } from "@/lib/types";
import { Button } from "../ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { suggestBillingService } from "@/ai/flows/suggest-billing-service";

interface BillingTabProps {
  searchTerm: string;
}

export function BillingTab({ searchTerm }: BillingTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [amount, setAmount] = useState("");
  const [service, setService] = useState("");
  const { toast } = useToast();
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const handleSuggestService = async () => {
    if (!selectedPatientId) {
       toast({
        variant: "destructive",
        title: "لم يتم تحديد مريض",
        description: "الرجاء اختيار مريض أولاً لاقتراح خدمة.",
      });
      return;
    }
    setIsLoadingSuggestion(true);
    try {
      const recentAppointments = mockAppointments
        .filter((a) => a.patientId === selectedPatientId && a.status === 'Completed')
        .sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


      if (recentAppointments.length === 0) {
        toast({
          title: "لا يوجد تاريخ للمريض",
          description: "لا يمكن اقتراح خدمة لعدم وجود مواعيد مكتملة.",
        });
        return;
      }
      
      const result = await suggestBillingService({
        patientId: selectedPatientId,
        recentAppointments: recentAppointments.map(a => ({
            doctorSpecialty: a.doctorSpecialty,
            dateTime: a.dateTime,
            status: a.status
        }))
      });

      if (result && result.service) {
        setService(result.service);
        toast({
          title: "تم اقتراح الخدمة بنجاح!",
        });
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "خطأ في الاقتراح",
        description: "حدث خطأ أثناء محاولة اقتراح الخدمة.",
      });
      console.error("Error suggesting service:", error);
    } finally {
        setIsLoadingSuggestion(false);
    }
  };


  const handleRecordTransaction = () => {
    if (!selectedPatientId || !amount || !service) {
      toast({
        variant: "destructive",
        title: "معلومات ناقصة",
        description: "يرجى تعبئة جميع الحقول.",
      });
      return;
    }

    const patient = mockPatients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: patient.name,
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      status: 'Success',
      service,
    };

    setTransactions(prev => [newTransaction, ...prev]);

    toast({
      title: "تم تسجيل الفاتورة",
      description: `تم تسجيل فاتورة بمبلغ ${amount} لـ ${patient.name}.`,
    });

    setIsDialogOpen(false);
  }

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(transaction =>
      transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);
  
  const resetDialog = useCallback(() => {
    setSelectedPatientId(undefined);
    setAmount("");
    setService("");
    setIsLoadingSuggestion(false);
  }, []);

  useEffect(() => {
    if (!isDialogOpen) {
      resetDialog();
    }
  }, [isDialogOpen, resetDialog]);


  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الفواتير</CardTitle>
            <CardDescription>عرض وإدارة جميع المعاملات المالية.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>تسجيل فاتورة</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تسجيل فاتورة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الفاتورة الجديدة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient" className="text-right">
                    المريض
                  </Label>
                   <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger id="patient" className="col-span-3">
                      <SelectValue placeholder="اختر مريضاً" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">الخدمة</Label>
                  <div className="col-span-3 flex items-center gap-2">
                     <Input id="service" placeholder="مثال: فحص عام" className="flex-grow" value={service} onChange={(e) => setService(e.target.value)} />
                      <Button variant="outline" size="icon" onClick={handleSuggestService} disabled={isLoadingSuggestion || !selectedPatientId}>
                          {isLoadingSuggestion ? <Loader2 className="animate-spin" /> : <Sparkles />}
                          <span className="sr-only">Suggest Service</span>
                      </Button>
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">المبلغ ($)</Label>
                  <Input id="amount" type="number" placeholder="150.00" className="col-span-3" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                 <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button onClick={handleRecordTransaction}>حفظ الفاتورة</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>المريض</TableHead>
              <TableHead>الخدمة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs text-left">{transaction.id}</TableCell>
                <TableCell>{transaction.patientName}</TableCell>
                <TableCell>{transaction.service}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString('ar-EG')}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                   <Badge variant={
                     transaction.status === 'Success' ? 'success' : 'destructive'
                   }>
                    {transaction.status === 'Success' ? 'ناجحة' : 'فاشلة'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
             {filteredTransactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        لا توجد فواتير تطابق معايير البحث.
                    </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
