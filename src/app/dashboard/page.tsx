
"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Stethoscope,
  CalendarDays,
  Users,
  CreditCard,
  Menu,
  MessageSquare,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { Overview } from "@/components/dashboard/overview"
import { AppointmentsTab } from "@/components/dashboard/appointments-tab"
import { DoctorsTab } from "@/components/dashboard/doctors-tab"
import { PatientsTab } from "@/components/dashboard/patients-tab"
import { AnalyticsTab } from "@/components/dashboard/analytics-tab"
import { BillingTab } from "@/components/dashboard/billing-tab"
import { UsersTab } from "@/components/dashboard/users-tab"
import { ChatTab } from "@/components/dashboard/chat-tab"
import { cn } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'
import { GlobalSearch } from "@/components/dashboard/global-search"
import type { Patient } from "@/lib/types"
import { PatientDetails } from "@/components/patient-details"
import { AppointmentScheduler } from "@/components/appointment-scheduler"


type TabValue = "dashboard" | "appointments" | "doctors" | "patients" | "billing" | "analytics" | "users" | "chat";

export default function Dashboard() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as TabValue || 'dashboard';

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState<Patient | null>(null);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue;
    if (tab && navLinks.some(l => l.id === tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    window.history.pushState({}, '', `/dashboard?tab=${value}`);
    setIsSheetOpen(false); // Close sheet on tab change
  }

  const navLinks = [
    { id: "dashboard", label: "الرئيسية", icon: Home, href: "/dashboard?tab=dashboard" },
    { id: "appointments", label: "المواعيد", icon: CalendarDays, badge: "6", href: "/dashboard?tab=appointments" },
    { id: "doctors", label: "الأطباء", icon: Stethoscope, href: "/dashboard?tab=doctors" },
    { id: "patients", label: "المرضى", icon: Users, href: "/dashboard?tab=patients" },
    { id: "billing", label: "الفواتير", icon: CreditCard, href: "/dashboard?tab=billing" },
    { id: "chat", label: "الدردشة", icon: MessageSquare, href: "/dashboard?tab=chat" },
    { id: "analytics", label: "التحليلات", icon: LineChart, href: "/dashboard?tab=analytics" },
    { id: "users", label: "المستخدمون", icon: Users, href: "/dashboard?tab=users" },
  ];

  const renderNavLinks = (isMobile: boolean = false) => (
    <nav className={cn(
      "grid items-start px-2 text-sm font-medium lg:px-4",
      isMobile ? "grid gap-2 text-lg font-medium" : "grid items-start text-sm font-medium"
    )}>
      {isMobile && (
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold mb-4"
          onClick={() => setIsSheetOpen(false)}
        >
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="">صحة تك</span>
        </Link>
      )}
      {navLinks.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          onClick={(e) => {
            e.preventDefault(); // Prevent full page reload
            handleTabChange(link.id)
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
             activeTab === link.id ? "bg-muted text-primary" : "text-muted-foreground",
             isMobile && "mx-[-0.65rem] gap-4 rounded-xl",
          )}
        >
          <link.icon className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          {link.label}
          {link.badge && (
             <Badge className="mr-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badge}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );

  const handlePatientCreated = (newPatient: Patient) => {
    // This is a placeholder. The actual patient list state is in PatientsTab.
    // We might need to lift state up or use a global state manager if we want
    // the new patient to be immediately searchable in GlobalSearch.
    // For now, this just closes the modals.
    setIsAppointmentModalOpen(false);
  }


  return (
    <>
    <div className="grid min-h-screen w-full md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_280px]">
       <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">فتح قائمة التنقل</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
               <SheetHeader>
                <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
              </SheetHeader>
               {renderNavLinks(true)}
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">فتح قائمة المستخدم</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>الإعدادات</DropdownMenuItem>
              <DropdownMenuItem>الدعم</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <div className="w-full flex-1">
             <GlobalSearch 
                onViewProfile={setSelectedPatientForProfile}
                onNewAppointment={(patient) => {
                  setSelectedPatientForAppointment(patient);
                  setIsAppointmentModalOpen(true);
                }}
             />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl capitalize">
              {navLinks.find(l => l.id === activeTab)?.label}
            </h1>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v)} className="w-full">
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
             <TabsContent value="chat">
              <ChatTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
       <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Button variant="outline" size="icon" className="mr-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">فتح الإشعارات</span>
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">صحة تك</span>
              <Stethoscope className="h-6 w-6 text-primary" />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
             {renderNavLinks()}
          </div>
        </div>
      </div>
    </div>
    {selectedPatientForProfile && (
      <PatientDetails
        patient={selectedPatientForProfile}
        isOpen={!!selectedPatientForProfile}
        onOpenChange={(isOpen) => !isOpen && setSelectedPatientForProfile(null)}
      />
    )}
     {isAppointmentModalOpen && selectedPatientForAppointment && (
        <AppointmentScheduler
            onAppointmentCreated={() => setIsAppointmentModalOpen(false)}
            onPatientCreated={handlePatientCreated}
            selectedPatientId={selectedPatientForAppointment.id}
            context="new-appointment"
        />
     )}
    </>
  )
}

    