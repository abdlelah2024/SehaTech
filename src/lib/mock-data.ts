
import type { Patient, Doctor, Appointment, RecentActivity, Transaction, User } from "./types";
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


export const mockDoctors: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'إميلي كارتر',
    specialty: 'أمراض القلب',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'غداً، 10:00 ص',
    isAvailableToday: true,
    availability: [
      { date: '2024-08-01', slots: ['10:00', '10:30', '14:00', '14:30'] },
      { date: '2024-08-02', slots: ['09:00', '09:30', '11:00'] },
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
       { date: '2024-08-01', slots: ['14:00', '14:30', '15:00', '15:30'] },
       { date: '2024-08-03', slots: ['10:00', '10:30'] },
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
       { date: '2024-08-05', slots: ['09:00', '09:30', '10:00'] },
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
      { date: '2024-08-01', slots: ['11:30', '12:00', '16:00'] },
      { date: '2024-08-02', slots: ['14:00', '14:30'] },
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
  { id: 'user-1', name: 'علي عبدالله', email: 'ali@example.com', role: 'admin' },
  { id: 'user-2', name: 'سالم محمد', email: 'salem@example.com', role: 'receptionist' },
  { id: 'user-3', name: 'د. إميلي كارتر', email: 'emily.carter@example.com', role: 'doctor' },
  { id: 'user-4', name: 'د. بنيامين لي', email: 'ben.lee@example.com', role: 'doctor' },
];
