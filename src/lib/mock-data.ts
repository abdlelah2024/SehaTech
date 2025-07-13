
import type { Patient, Doctor, Appointment, RecentActivity, Transaction, User, Conversation, AuditLog } from "./types";
import { getPatientInitials } from "./utils";
import { subDays, set } from 'date-fns';

const now = new Date(2025, 6, 13, 10, 30, 0); // Use a fixed date for deterministic mock data

const patientNames = [
  'أحمد الصالح', 'فاطمة الزهراء', 'خالد المصري', 'عائشة الشامي', 'يوسف العراقي',
  'نور الهاشمي', 'محمد الخالدي', 'سارة المغربي', 'علي التميمي', 'مريم الأنصاري'
];

export const mockPatients: Patient[] = patientNames.map((name, index) => ({
  id: `patient-${index + 1}`,
  name: name,
  dob: `${1980 + (index * 2)}-${(index % 12) + 1}-${(index % 28) + 1}`,
  gender: index % 3 === 0 ? 'ذكر' : 'أنثى',
  phone: `777-010${index + 1}`,
  address: `شارع ${index + 1}، المدينة`,
  avatarUrl: `https://placehold.co/40x40.png?text=${getPatientInitials(name)}`,
  createdAt: subDays(now, index * 10).toISOString(), // Simulate patient creation date
}));

// Function to get a future date string
const getFutureDate = (daysToAdd: number): string => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
};

export const mockDoctors: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'إميلي كارتر',
    specialty: 'أمراض القلب',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'غداً، 10:00 ص',
    isAvailableToday: true,
    availability: [
      { date: getFutureDate(1), slots: ['10:00', '10:30', '14:00', '14:30'] },
      { date: getFutureDate(2), slots: ['09:00', '09:30', '11:00'] },
      { date: getFutureDate(4), slots: ['10:00', '10:30', '14:00', '14:30'] },
    ],
    servicePrice: 7500,
    freeReturnDays: 14,
    availableDays: ['الأحد', 'الثلاثاء', 'الخميس'],
  },
  {
    id: 'doctor-2',
    name: 'بنيامين لي',
    specialty: 'الأمراض الجلدية',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'اليوم، 2:00 م',
    isAvailableToday: true,
    availability: [
       { date: getFutureDate(0), slots: ['14:00', '14:30', '15:00', '15:30'] },
       { date: getFutureDate(3), slots: ['10:00', '10:30'] },
       { date: getFutureDate(5), slots: ['14:00', '14:30', '15:00', '15:30'] },
    ],
    servicePrice: 6000,
    freeReturnDays: 10,
    availableDays: ['السبت', 'الاثنين', 'الأربعاء'],
  },
  {
    id: 'doctor-3',
    name: 'أوليفيا جارسيا',
    specialty: 'طب الأطفال',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'الاثنين القادم، 9:00 ص',
    isAvailableToday: false,
    availability: [
       { date: getFutureDate(5), slots: ['09:00', '09:30', '10:00'] },
       { date: getFutureDate(7), slots: ['09:00', '09:30', '10:00'] },
    ],
    servicePrice: 5000,
    freeReturnDays: 7,
    availableDays: ['الاثنين', 'الأربعاء', 'الجمعة'],
  },
  {
    id: 'doctor-4',
    name: 'ويليام رودريغيز',
    specialty: 'جراحة العظام',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'اليوم، 11:30 ص',
    isAvailableToday: true,
    availability: [
      { date: getFutureDate(0), slots: ['11:30', '12:00', '16:00'] },
      { date: getFutureDate(1), slots: ['14:00', '14:30'] },
      { date: getFutureDate(3), slots: ['11:30', '12:00', '16:00'] },
    ],
    servicePrice: 9000,
    freeReturnDays: 21,
    availableDays: ['السبت', 'الأحد', 'الثلاثاء', 'الخميس'],
  }
];


export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: set(now, { hours: 10, minutes: 0 }).toISOString(),
    status: 'Scheduled',
  },
  {
    id: 'appt-2',
    patientId: 'patient-2',
    patientName: mockPatients[1].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: subDays(now, 1).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-3',
    patientId: 'patient-3',
    patientName: mockPatients[2].name,
    doctorId: 'doctor-3',
    doctorName: `د. ${mockDoctors[2].name}`,
    doctorSpecialty: mockDoctors[2].specialty,
    dateTime: set(now, { hours: 11, minutes: 30 }).toISOString(),
    status: 'Waiting',
  },
   {
    id: 'appt-4',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: subDays(now, 5).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-5',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: subDays(now, -3).toISOString(),
    status: 'Follow-up',
  },
  {
    id: 'appt-6',
    patientId: 'patient-4',
    patientName: mockPatients[3].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: subDays(now, -2).toISOString(),
    status: 'Scheduled',
  },
   {
    id: 'appt-7',
    patientId: 'patient-5',
    patientName: mockPatients[4].name,
    doctorId: 'doctor-4',
    doctorName: `د. ${mockDoctors[3].name}`,
    doctorSpecialty: mockDoctors[3].specialty,
    dateTime: subDays(now, 10).toISOString(),
    status: 'Completed',
  },
   // Add past appointments for patient 1 with doctor 1 to test suggestions
  {
    id: 'appt-8',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: subDays(now, 7).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-9',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: subDays(now, 14).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-10',
    patientId: 'patient-6',
    patientName: mockPatients[5].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: set(now, { hours: 9, minutes: 0 }).toISOString(),
    status: 'Completed',
  }
].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    actor: 'أحمد الصالح',
    action: 'حجز موعداً جديداً مع د. إميلي كارتر.',
    timestamp: 'قبل دقيقتين',
  },
  {
    id: 'act-2',
    actor: 'فاطمة الزهراء',
    action: 'أكملت موعدها مع د. بنيامين لي.',
    timestamp: 'قبل ساعة',
  },
  {
    id: 'act-3',
    actor: 'المدير',
    action: 'قام بتحديث ملف المريضة مريم الأنصاري.',
    timestamp: 'قبل 3 ساعات',
  },
  {
    id: 'act-4',
    actor: 'د. أوليفيا جارسيا',
    action: 'أضافت مواعيد متاحة جديدة للأسبوع القادم.',
    timestamp: 'قبل يوم',
  },
];

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', patientId: 'patient-2', patientName: mockPatients[1].name, date: subDays(now, 1).toISOString(), amount: 6000, status: 'Success', service: 'فحص جلدي' },
  { id: 'txn-2', patientId: 'patient-1', patientName: mockPatients[0].name, date: subDays(now, 5).toISOString(), amount: 7500, status: 'Success', service: 'زيارة متابعة' },
  { id: 'txn-3', patientId: 'patient-5', patientName: mockPatients[4].name, date: subDays(now, 10).toISOString(), amount: 9000, status: 'Success', service: 'أشعة سينية' },
  { id: 'txn-4', patientId: 'patient-3', patientName: mockPatients[2].name, date: subDays(now, 2).toISOString(), amount: 5000, status: 'Failed', service: 'تطعيم' },
  { id: 'txn-5', patientId: 'patient-4', patientName: mockPatients[3].name, date: subDays(now, 1).toISOString(), amount: 7500, status: 'Success', service: 'تخطيط قلب' },
  { id: 'txn-6', patientId: 'patient-6', patientName: mockPatients[5].name, date: now.toISOString(), amount: 7500, status: 'Success', service: 'استشارة' },
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'علي عبدالله', email: 'ali@example.com', role: 'admin', status: 'online' },
  { id: 'user-2', name: 'سالم محمد', email: 'salem@example.com', role: 'receptionist', status: 'offline' },
  { id: 'user-3', name: 'د. إميلي كارتر', email: 'emily.carter@example.com', role: 'doctor', status: 'online' },
  { id: 'user-4', name: 'د. بنيامين لي', email: 'ben.lee@example.com', role: 'doctor', status: 'offline' },
];

export const mockConversations: Conversation[] = [
  {
    userId: 'user-2', // سالم محمد
    messages: [
      { id: 'msg-1', senderId: 'user-1', receiverId: 'user-2', text: 'مرحباً سالم، هل يمكنك مراجعة جدول مواعيد د. إميلي لهذا اليوم؟', timestamp: subDays(now, 0.05).toISOString() },
      { id: 'msg-2', senderId: 'user-2', receiverId: 'user-1', text: 'أهلاً علي. بالتأكيد، لحظة من فضلك.', timestamp: subDays(now, 0.04).toISOString() },
      { id: 'msg-3', senderId: 'user-2', receiverId: 'user-1', text: 'الجدول يبدو ممتلئاً بعد الظهر، ولكن هناك فراغ في الساعة 11 صباحاً.', timestamp: subDays(now, 0.03).toISOString() },
      { id: 'msg-4', senderId: 'user-1', receiverId: 'user-2', text: 'ممتاز، شكراً جزيلاً لك.', timestamp: subDays(now, 0.02).toISOString() },
    ]
  },
  {
    userId: 'user-3', // د. إميلي كارتر
    messages: [
       { id: 'msg-5', senderId: 'user-1', receiverId: 'user-3', text: 'مرحباً د. إميلي، هل يمكنكِ إلقاء نظرة على نتائج المريض أحمد الصالح؟', timestamp: subDays(now, 0.1).toISOString() },
       { id: 'msg-6', senderId: 'user-3', receiverId: 'user-1', text: 'أهلاً، سأقوم بذلك حالاً.', timestamp: subDays(now, 0.09).toISOString() },
    ]
  }
]

export const mockAuditLogs: AuditLog[] = [
    { id: 'log-1', user: 'علي عبدالله', userRole: 'admin', action: 'أضاف المستخدم الجديد: سالم محمد', section: 'المستخدمون', timestamp: subDays(now, 0.01).toISOString() },
    { id: 'log-2', user: 'سالم محمد', userRole: 'receptionist', action: 'حجز موعدًا للمريض: أحمد الصالح', section: 'المواعيد', timestamp: subDays(now, 0.02).toISOString() },
    { id: 'log-3', user: 'علي عبدالله', userRole: 'admin', action: 'حذف الطبيب: د. ويليام رودريغيز', section: 'الأطباء', timestamp: subDays(now, 0.03).toISOString() },
    { id: 'log-4', user: 'د. إميلي كارتر', userRole: 'doctor', action: 'عرض ملف المريض: فاطمة الزهراء', section: 'المرضى', timestamp: subDays(now, 0.04).toISOString() },
    { id: 'log-5', user: 'سالم محمد', userRole: 'receptionist', action: 'سجل فاتورة للمريض: خالد المصري', section: 'الفواتير', timestamp: subDays(now, 0.05).toISOString() },
];
    

    
