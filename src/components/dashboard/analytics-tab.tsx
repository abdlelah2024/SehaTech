
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import { mockAppointments } from "@/lib/mock-data"
import { useMemo } from "react"

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function AnalyticsTab() {
  const chartData = useMemo(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyCounts = monthNames.map(month => ({ month, appointments: 0 }));

    mockAppointments.forEach(appointment => {
      const monthIndex = new Date(appointment.dateTime).getMonth();
      monthlyCounts[monthIndex].appointments++;
    });

    // For this demo, let's just show the last 6 months that have data or are recent.
    // In a real app, this logic would be more robust.
    const currentMonth = new Date().getMonth();
    const lastSixMonthsData = [];
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        lastSixMonthsData.push(monthlyCounts[monthIndex]);
    }

    // A fallback for when there's not enough data in mockAppointments
    if (lastSixMonthsData.every(d => d.appointments === 0)) {
       return [
        { month: "January", appointments: 186 },
        { month: "February", appointments: 305 },
        { month: "March", appointments: 237 },
        { month: "April", appointments: 273 },
        { month: "May", appointments: 209 },
        { month: "June", appointments: 214 },
      ]
    }


    return lastSixMonthsData;
  }, []);


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Appointment Analytics</CardTitle>
        <CardDescription>
          A summary of appointments over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
