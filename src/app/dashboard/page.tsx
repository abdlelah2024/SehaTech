
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
  Search,
  CreditCard,
  Menu,
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
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'


type TabValue = "dashboard" | "appointments" | "doctors" | "patients" | "billing" | "analytics" | "users";

export default function Dashboard() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as TabValue || 'dashboard';

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
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
             <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badge}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );


  return (
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
          <div className="w-full flex-1">
             {/* Global Search Bar Removed */}
          </div>
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
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl capitalize">
              {navLinks.find(l => l.id === activeTab)?.label || activeTab}
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
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="">صحة تك</span>
            </Link>
            <Button variant="outline" size="icon" className="mr-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">فتح الإشعارات</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
             {renderNavLinks()}
          </div>
        </div>
      </div>
    </div>
  )
}
