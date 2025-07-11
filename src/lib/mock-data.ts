import type { Patient, Doctor, Appointment, RecentActivity, Transaction } from "./types";

export const mockPatients: Patient[] = [
  { id: 'patient-1', name: 'John Doe', email: 'john.doe@example.com', dob: '1985-05-20', gender: 'Male', phone: '555-0101', address: '123 Maple St, Springfield' },
  { id: 'patient-2', name: 'Jane Smith', email: 'jane.smith@example.com', dob: '1992-08-15', gender: 'Female', phone: '555-0102', address: '456 Oak Ave, Springfield' },
  { id: 'patient-3', name: 'Peter Jones', email: 'peter.jones@example.com', dob: '1978-11-30', gender: 'Male', phone: '555-0103', address: '789 Pine Ln, Springfield' },
  { id: 'patient-4', name: 'Mary Johnson', email: 'mary.j@example.com', dob: '2001-02-10', gender: 'Female', phone: '555-0104', address: '101 Elm Ct, Springfield' },
  { id: 'patient-5', name: 'David Williams', email: 'd.williams@example.com', dob: '1995-07-22', gender: 'Male', phone: '555-0105', address: '212 Birch Rd, Springfield' },
  { id: 'patient-6', name: 'Linda Brown', email: 'linda.brown@example.com', dob: '1988-03-12', gender: 'Female', phone: '555-0106', address: '333 Cedar Dr, Springfield' },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'Emily Carter',
    specialty: 'Cardiology',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'Tomorrow, 10:00 AM',
    isAvailableToday: true,
    availability: [
      { date: '2024-08-01', slots: ['10:00', '10:30', '14:00', '14:30'] },
      { date: '2024-08-02', slots: ['09:00', '09:30', '11:00'] },
    ]
  },
  {
    id: 'doctor-2',
    name: 'Benjamin Lee',
    specialty: 'Dermatology',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'Today, 2:00 PM',
    isAvailableToday: true,
    availability: [
       { date: '2024-08-01', slots: ['14:00', '14:30', '15:00', '15:30'] },
       { date: '2024-08-03', slots: ['10:00', '10:30'] },
    ]
  },
  {
    id: 'doctor-3',
    name: 'Olivia Garcia',
    specialty: 'Pediatrics',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'Next Monday, 9:00 AM',
    isAvailableToday: false,
    availability: [
       { date: '2024-08-05', slots: ['09:00', '09:30', '10:00'] },
    ]
  },
  {
    id: 'doctor-4',
    name: 'William Rodriguez',
    specialty: 'Orthopedics',
    image: 'https://placehold.co/100x100.png',
    nextAvailable: 'Today, 11:30 AM',
    isAvailableToday: true,
    availability: [
      { date: '2024-08-01', slots: ['11:30', '12:00', '16:00'] },
      { date: '2024-08-02', slots: ['14:00', '14:30'] },
    ]
  }
];


const now = new Date();
export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Emily Carter',
    doctorSpecialty: 'Cardiology',
    dateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'Scheduled',
  },
  {
    id: 'appt-2',
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Benjamin Lee',
    doctorSpecialty: 'Dermatology',
    dateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-3',
    patientId: 'patient-3',
    patientName: 'Peter Jones',
    doctorId: 'doctor-3',
    doctorName: 'Dr. Olivia Garcia',
    doctorSpecialty: 'Pediatrics',
    dateTime: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
    status: 'Waiting',
  },
   {
    id: 'appt-4',
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Benjamin Lee',
    doctorSpecialty: 'Dermatology',
    dateTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
  },
  {
    id: 'appt-5',
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Benjamin Lee',
    doctorSpecialty: 'Dermatology',
    dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Follow-up',
  },
  {
    id: 'appt-6',
    patientId: 'patient-4',
    patientName: 'Mary Johnson',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Emily Carter',
    doctorSpecialty: 'Cardiology',
    dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Scheduled',
  },
   {
    id: 'appt-7',
    patientId: 'patient-5',
    patientName: 'David Williams',
    doctorId: 'doctor-4',
    doctorName: 'Dr. William Rodriguez',
    doctorSpecialty: 'Orthopedics',
    dateTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
  },
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    actor: 'John Doe',
    action: 'scheduled a new appointment with Dr. Emily Carter.',
    timestamp: '2 minutes ago',
  },
  {
    id: 'act-2',
    actor: 'Jane Smith',
    action: 'had a completed appointment with Dr. Benjamin Lee.',
    timestamp: '1 hour ago',
  },
  {
    id: 'act-3',
    actor: 'Admin',
    action: 'updated the profile for patient Mary Johnson.',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-4',
    actor: 'Dr. Olivia Garcia',
    action: 'added new availability for next week.',
    timestamp: '1 day ago',
  },
];

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', patientId: 'patient-2', patientName: 'Jane Smith', date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), amount: 150.00, status: 'Success' },
  { id: 'txn-2', patientId: 'patient-1', patientName: 'John Doe', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 200.00, status: 'Success' },
  { id: 'txn-3', patientId: 'patient-5', patientName: 'David Williams', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), amount: 75.50, status: 'Success' },
  { id: 'txn-4', patientId: 'patient-3', patientName: 'Peter Jones', date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 110.00, status: 'Failed' },
  { id: 'txn-5', patientId: 'patient-4', patientName: 'Mary Johnson', date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 300.00, status: 'Success' },
];
