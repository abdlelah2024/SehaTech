
"use client"

import { useState } from "react"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Stethoscope,
  CalendarDays,
  Users,
  Search,
  CreditCard,
  Menu,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { Overview } from "@/components/dashboard/overview"
import { AppointmentsTab } from "@/components/dashboard/appointments-tab"
import { DoctorsTab } from "@/components/dashboard/doctors-tab"
import { PatientsTab } from "@/components/dashboard/patients-tab"
import { AnalyticsTab } from "@/components/dashboard/analytics-tab"
import { BillingTab } from "@/components/dashboard/billing-tab"
import { cn } from "@/lib/utils"

type TabValue = "dashboard" | "appointments" | "doctors" | "patients" | "analytics" | "billing";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  }

  const navLinks = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "appointments", label: "Appointments", icon: CalendarDays, badge: "6" },
    { id: "doctors", label: "Doctors", icon: Stethoscope },
    { id: "patients", label: "Patients", icon: Users },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: LineChart },
  ];

  const renderNavLinks = (isMobile: boolean = false) => (
    <nav className={cn(
      isMobile ? "grid gap-2 text-lg font-medium" : "grid items-start px-2 text-sm font-medium lg:px-4"
    )}>
      {isMobile && (
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold mb-4"
        >
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="sr-only">SehaTech</span>
        </Link>
      )}
      {navLinks.map((link) => (
        <button
          key={link.id}
          onClick={() => {
             handleTabChange(link.id)
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
             activeTab === link.id ? "bg-muted text-primary" : "text-muted-foreground",
             isMobile && "mx-[-0.65rem] gap-4 rounded-xl",
             isMobile && activeTab === link.id && "bg-muted text-foreground",
             isMobile && activeTab !== link.id && "text-muted-foreground hover:text-foreground"
          )}
        >
          <link.icon className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          {link.label}
          {link.badge && (
             <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="">SehaTech</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
             {renderNavLinks()}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               {renderNavLinks(true)}
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl capitalize">{activeTab}</h1>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsContent value="dashboard">
              <Overview />
            </TabsContent>
            <TabsContent value="appointments">
              <AppointmentsTab />
            </TabsContent>
            <TabsContent value="doctors">
              <DoctorsTab />
            </TabsContent>
            <TabsContent value="patients">
              <PatientsTab />
            </TabsContent>
            <TabsContent value="billing">
              <BillingTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
