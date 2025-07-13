
import type { Patient, Doctor, Appointment, RecentActivity, Transaction, User, Conversation } from "./types";
import { getPatientInitials } from "./utils";

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
  avatarUrl: `https://placehold.co/40x40.png?text=${getPatientInitials(name)}`
}));

// Function to get a future date string
const getFutureDate = (daysToAdd: number): string => {
    const date = new Date();
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


const now = new Date();
export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'Scheduled',
  },
  {
    id: 'appt-2',
    patientId: 'patient-2',
    patientName: mockPatients[1].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-3',
    patientId: 'patient-3',
    patientName: mockPatients[2].name,
    doctorId: 'doctor-3',
    doctorName: `د. ${mockDoctors[2].name}`,
    doctorSpecialty: mockDoctors[2].specialty,
    dateTime: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
    status: 'Waiting',
  },
   {
    id: 'appt-4',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-5',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-2',
    doctorName: `د. ${mockDoctors[1].name}`,
    doctorSpecialty: mockDoctors[1].specialty,
    dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Follow-up',
  },
  {
    id: 'appt-6',
    patientId: 'patient-4',
    patientName: mockPatients[3].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Scheduled',
  },
   {
    id: 'appt-7',
    patientId: 'patient-5',
    patientName: mockPatients[4].name,
    doctorId: 'doctor-4',
    doctorName: `د. ${mockDoctors[3].name}`,
    doctorSpecialty: mockDoctors[3].specialty,
    dateTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
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
    dateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    status: 'Completed',
  },
  {
    id: 'appt-9',
    patientId: 'patient-1',
    patientName: mockPatients[0].name,
    doctorId: 'doctor-1',
    doctorName: `د. ${mockDoctors[0].name}`,
    doctorSpecialty: mockDoctors[0].specialty,
    dateTime: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    status: 'Completed',
  },
];

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
  { id: 'txn-1', patientId: 'patient-2', patientName: mockPatients[1].name, date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), amount: 6000, status: 'Success', service: 'فحص جلدي' },
  { id: 'txn-2', patientId: 'patient-1', patientName: mockPatients[0].name, date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 7500, status: 'Success', service: 'زيارة متابعة' },
  { id: 'txn-3', patientId: 'patient-5', patientName: mockPatients[4].name, date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), amount: 9000, status: 'Success', service: 'أشعة سينية' },
  { id: 'txn-4', patientId: 'patient-3', patientName: mockPatients[2].name, date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 5000, status: 'Failed', service: 'تطعيم' },
  { id: 'txn-5', patientId: 'patient-4', patientName: mockPatients[3].name, date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 7500, status: 'Success', service: 'تخطيط قلب' },
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
      { id: 'msg-1', senderId: 'user-1', receiverId: 'user-2', text: 'مرحباً سالم، هل يمكنك مراجعة جدول مواعيد د. إميلي لهذا اليوم؟', timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString() },
      { id: 'msg-2', senderId: 'user-2', receiverId: 'user-1', text: 'أهلاً علي. بالتأكيد، لحظة من فضلك.', timestamp: new Date(now.getTime() - 59 * 60 * 1000).toISOString() },
      { id: 'msg-3', senderId: 'user-2', receiverId: 'user-1', text: 'الجدول يبدو ممتلئاً بعد الظهر، ولكن هناك فراغ في الساعة 11 صباحاً.', timestamp: new Date(now.getTime() - 58 * 60 * 1000).toISOString() },
      { id: 'msg-4', senderId: 'user-1', receiverId: 'user-2', text: 'ممتاز، شكراً جزيلاً لك.', timestamp: new Date(now.getTime() - 57 * 60 * 1000).toISOString() },
    ]
  },
  {
    userId: 'user-3', // د. إميلي كارتر
    messages: [
       { id: 'msg-5', senderId: 'user-1', receiverId: 'user-3', text: 'مرحباً د. إميلي، هل يمكنكِ إلقاء نظرة على نتائج المريض أحمد الصالح؟', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
       { id: 'msg-6', senderId: 'user-3', receiverId: 'user-1', text: 'أهلاً، سأقوم بذلك حالاً.', timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString() },
    ]
  }
]

    