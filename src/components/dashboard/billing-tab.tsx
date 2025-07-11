
"use client";

import { useMemo } from "react";
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
import { mockTransactions } from "@/lib/mock-data"

interface BillingTabProps {
  searchTerm: string;
}

export function BillingTab({ searchTerm }: BillingTabProps) {

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return mockTransactions;
    return mockTransactions.filter(transaction =>
      transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Card className="mt-4">
       <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>View and manage all financial transactions.</CardDescription>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Patient</TableHead>
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
