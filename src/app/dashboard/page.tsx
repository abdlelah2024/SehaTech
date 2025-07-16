
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  History,
  SlidersHorizontal,
  FileText,
  Inbox,
} from "lucide-react"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";


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
import { ChatTab } from "@/components/dashboard/chat-tab"
import { AuditLogTab } from "@/components/dashboard/audit-log-tab"
import { SettingsTab } from "@/components/dashboard/settings-tab"
import { ReportsTab } from "@/components/dashboard/reports-tab"
import { InboxTab } from "@/components/dashboard/inbox-tab"
import { cn } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'
import { GlobalSearch } from "@/components/dashboard/global-search"
import type { Patient, User, Doctor, Appointment, Transaction, AuditLog, InboxMessage } from "@/lib/types"
import { PatientDetails } from "@/components/patient-details"
import { AppointmentScheduler } from "@/components/appointment-scheduler"
import { usePermissions } from "@/hooks/use-permissions"
import { useToast } from "@/hooks/use-toast"
import { logAuditEvent } from "@/lib/audit-log-service"


type TabValue = "dashboard" | "appointments" | "doctors" | "patients" | "billing" | "chat" | "analytics" | "reports" | "settings" | "audit-log" | "inbox";


export default function Dashboard() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as TabValue || 'dashboard';
  const { toast } = useToast()

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const permissions = usePermissions(currentUser?.role);

  const [allData, setAllData] = useState<{
    patients: Patient[];
    doctors: Doctor[];
    appointments: Appointment[];
    transactions: Transaction[];
    users: User[];
    auditLogs: AuditLog[];
    inboxMessages: InboxMessage[];
  }>({
    patients: [],
    doctors: [],
    appointments: [],
    transactions: [],
    users: [],
    auditLogs: [],
    inboxMessages: [],
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() } as User);
          }
        });
        return () => unsubscribeUser();
      } else {
        router.push('/');
      }
    });

    const unsubAppointments = onSnapshot(collection(db, "appointments"), snap => setAllData(prev => ({...prev, appointments: snap.docs.map(d => ({id: d.id, ...d.data()}) as Appointment)})));
    const unsubPatientsColl = onSnapshot(collection(db, "patients"), snap => setAllData(prev => ({...prev, patients: snap.docs.map(d => ({id: d.id, ...d.data()}) as Patient)})));
    const unsubDoctors = onSnapshot(collection(db, "doctors"), snap => setAllData(prev => ({...prev, doctors: snap.docs.map(d => ({id: d.id, ...d.data()}) as Doctor)})));
    const unsubTransactions = onSnapshot(collection(db, "transactions"), snap => setAllData(prev => ({...prev, transactions: snap.docs.map(d => ({id: d.id, ...d.data()}) as Transaction)})));
    const unsubUsers = onSnapshot(collection(db, "users"), snap => setAllData(prev => ({...prev, users: snap.docs.map(d => ({id: d.id, ...d.data()}) as User)})));
    const unsubAuditLogs = onSnapshot(collection(db, "auditLogs"), snap => setAllData(prev => ({...prev, auditLogs: snap.docs.map(d => ({id: d.id, ...d.data()}) as AuditLog)})));
    const unsubInbox = onSnapshot(collection(db, "inboxMessages"), snap => setAllData(prev => ({...prev, inboxMessages: snap.docs.map(d => ({id: d.id, ...d.data()}) as InboxMessage)})));

    return () => {
      unsubscribeAuth();
      unsubAppointments();
      unsubPatientsColl();
      unsubDoctors();
      unsubTransactions();
      unsubUsers();
      unsubAuditLogs();
      unsubInbox();
    };
  }, [router]);


  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState<Patient | null>(null);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const navLinks = [
    { id: "dashboard", label: "الرئيسية", icon: Home, href: "/dashboard?tab=dashboard", permission: "viewDashboard" },
    { id: "inbox", label: "البريد الوارد", icon: Inbox, badge: allData.inboxMessages.filter(m => !m.read).length.toString(), href: "/dashboard?tab=inbox", permission: "useChat" },
    { id: "appointments", label: "المواعيد", icon: CalendarDays, href: "/dashboard?tab=appointments", permission: "viewAppointments" },
    { id: "doctors", label: "الأطباء", icon: Stethoscope, href: "/dashboard?tab=doctors", permission: "viewDoctors" },
    { id: "patients", label: "المرضى", icon: Users, href: "/dashboard?tab=patients", permission: "viewPatients" },
    { id: "billing", label: "الفواتير", icon: CreditCard, href: "/dashboard?tab=billing", permission: "viewBilling" },
    { id: "chat", label: "الدردشة", icon: MessageSquare, href: "/dashboard?tab=chat", permission: "useChat" },
    { id: "analytics", label: "التحليلات", icon: LineChart, href: "/dashboard?tab=analytics", permission: "viewAnalytics" },
    { id: "reports", label: "التقارير", icon: FileText, href: "/dashboard?tab=reports", permission: "viewReports" },
    { id: "settings", label: "الإعدادات", icon: SlidersHorizontal, href: "/dashboard?tab=settings", permission: "manageSettings" },
    { id: "audit-log", label: "سجل التغييرات", icon: History, href: "/dashboard?tab=audit-log", permission: "viewAuditLog" },
  ];
  
  const accessibleLinks = useMemo(() => {
    if (!permissions) return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return navLinks.filter(link => permissions[link.permission as keyof typeof permissions]);
  }, [permissions]);
  
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue;
    if (tab && accessibleLinks.some(l => l.id === tab)) {
      setActiveTab(tab);
    } else if (accessibleLinks.length > 0) {
      setActiveTab(accessibleLinks[0].id as TabValue);
    }
  }, [searchParams, accessibleLinks]);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    window.history.pushState({}, '', `/dashboard?tab=${value}`);
    setIsSheetOpen(false); // Close sheet on tab change
  }

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
      {accessibleLinks.map((link) => (
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
          {link.badge && parseInt(link.badge, 10) > 0 && (
             <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badge}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
  
    const handleAppointmentCreated = useCallback(async (newAppointmentData: Omit<Appointment, 'id' | 'status'>) => {
    if (!currentUser) return;
     try {
        const docRef = await addDoc(collection(db, "appointments"), {
            ...newAppointmentData,
            status: 'Scheduled',
        });
        toast({
            title: "تم حجز الموعد بنجاح!",
            description: `تم حجز موعد جديد لـ ${newAppointmentData.patientName}.`,
        });
        await logAuditEvent('إنشاء موعد', { appointmentId: docRef.id, patientName: newAppointmentData.patientName }, currentUser.id);
        setIsAppointmentModalOpen(false);
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({
            variant: "destructive",
            title: "حدث خطأ!",
            description: "لم نتمكن من حجز الموعد.",
        });
    }
  }, [currentUser, toast]);
  
  const handlePatientCreated = useCallback(async (newPatientData: Omit<Patient, 'id'>) => {
    if (!currentUser) return;
    try {
        const docRef = await addDoc(collection(db, "patients"), {
            ...newPatientData,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "تم إنشاء ملف المريض بنجاح!",
        });
        await logAuditEvent('إضافة مريض', { patientId: docRef.id, patientName: newPatientData.name }, currentUser.id);
        setIsAppointmentModalOpen(false); // Close appointment scheduler if it was open for a new patient
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({
            variant: "destructive",
            title: "حدث خطأ!",
            description: "لم نتمكن من إضافة المريض.",
        });
    }
  }, [currentUser, toast]);


  if (!firebaseUser || !permissions || !currentUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>جار التحميل...</p>
        </div>
    )
  }

  return (
    <>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-l bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="">صحة تك</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">فتح الإشعارات</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
             {renderNavLinks()}
          </div>
        </div>
      </div>
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
             <GlobalSearch 
                patients={allData.patients}
                onViewProfile={setSelectedPatientForProfile}
                onNewAppointment={(patient) => {
                  setSelectedPatientForAppointment(patient);
                  setIsAppointmentModalOpen(true);
                }}
                onPatientCreated={handlePatientCreated}
             />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">فتح قائمة المستخدم</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{firebaseUser.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTabChange('settings')}>الإعدادات</DropdownMenuItem>
              <DropdownMenuItem>الدعم</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              {navLinks.find(l => l.id === activeTab)?.label}
            </h1>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v)} className="w-full">
            <TabsContent value="dashboard">
              <Overview 
                appointments={allData.appointments}
                transactions={allData.transactions}
                patients={allData.patients}
                doctors={allData.doctors}
                users={allData.users}
              />
            </TabsContent>
            <TabsContent value="inbox">
              <InboxTab messages={allData.inboxMessages} />
            </TabsContent>
            <TabsContent value="appointments">
              <AppointmentsTab appointments={allData.appointments} doctors={allData.doctors} patients={allData.patients} onAppointmentCreated={handleAppointmentCreated}/>
            </TabsContent>
            <TabsContent value="doctors">
              <DoctorsTab doctors={allData.doctors}/>
            </TabsContent>
            <TabsContent value="patients">
              <PatientsTab patients={allData.patients} onPatientCreated={handlePatientCreated} />
            </TabsContent>
            <TabsContent value="billing">
              <BillingTab transactions={allData.transactions} patients={allData.patients} appointments={allData.appointments} />
            </TabsContent>
             <TabsContent value="chat">
              <ChatTab currentUser={currentUser} allUsers={allData.users}/>
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab appointments={allData.appointments}/>
            </TabsContent>
            <TabsContent value="reports">
              <ReportsTab />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab currentUser={currentUser} users={allData.users} />
            </TabsContent>
            <TabsContent value="audit-log">
              <AuditLogTab logs={allData.auditLogs} users={allData.users} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
    {selectedPatientForProfile && (
      <PatientDetails
        patient={selectedPatientForProfile}
        isOpen={!!selectedPatientForProfile}
        onOpenChange={(isOpen) => !isOpen && setSelectedPatientForProfile(null)}
      />
    )}
     {isAppointmentModalOpen && (
        <AppointmentScheduler
            isOpen={isAppointmentModalOpen}
            onOpenChange={setIsAppointmentModalOpen}
            onAppointmentCreated={handleAppointmentCreated}
            onPatientCreated={handlePatientCreated}
            selectedPatientId={selectedPatientForAppointment?.id}
            patients={allData.patients}
            doctors={allData.doctors}
        />
     )}
    </>
  )
}


    