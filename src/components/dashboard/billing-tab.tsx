
"use client";

import { useMemo, useState } from "react";
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
import { mockTransactions, mockPatients } from "@/lib/mock-data"
import type { Transaction } from "@/lib/types";
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
import { Loader2, Sparkles } from "lucide-react";
import { suggestServiceAction } from "@/lib/actions";


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
  const [isSuggesting, setIsSuggesting] = useState(false);


  const handleRecordTransaction = () => {
    if (!selectedPatientId || !amount || !service) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields.",
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
      status: 'Success', // Assuming success for now
      service,
    };

    setTransactions(prev => [newTransaction, ...prev]);

    toast({
      title: "Transaction Recorded",
      description: `Charge of $${amount} for ${patient.name} has been recorded.`,
    });

    // Reset form
    setIsDialogOpen(false);
    setSelectedPatientId(undefined);
    setAmount("");
    setService("");
  }


  const handleSuggestService = async () => {
    if (!selectedPatientId) return;
    setIsSuggesting(true);
    try {
      const result = await suggestServiceAction({ patientId: selectedPatientId });
      if (result.service) {
        setService(result.service);
      } else {
        toast({
          title: "No Suggestion",
          description: "Could not suggest a service for this patient.",
        })
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get suggestion. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };


  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(transaction =>
      transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  return (
    <Card className="mt-4">
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Billing</CardTitle>
            <CardDescription>View and manage all financial transactions.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedPatientId(undefined);
              setAmount("");
              setService("");
            }
          }}>
            <DialogTrigger asChild>
              <Button>Record Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for the new charge.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient" className="text-right">
                    Patient
                  </Label>
                   <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger id="patient" className="col-span-3">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">Service</Label>
                  <Input id="service" placeholder="e.g. Annual Checkup" className="col-span-3" value={service} onChange={(e) => setService(e.target.value)} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3">
                    <Button variant="ghost" onClick={handleSuggestService} disabled={!selectedPatientId || isSuggesting} className="w-full justify-start gap-2 text-primary hover:text-primary disabled:text-muted-foreground disabled:no-underline">
                      {isSuggesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Suggest service with AI
                    </Button>
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount ($)</Label>
                  <Input id="amount" type="number" placeholder="150.00" className="col-span-3" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRecordTransaction}>Save Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                <TableCell>{transaction.patientName}</TableCell>
                <TableCell>{transaction.service}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                   <Badge variant={
                     transaction.status === 'Success' ? 'success' : 'destructive'
                   }>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
