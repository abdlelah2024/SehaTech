import type { Patient, Doctor, Appointment } from "./types";

export const mockPatients: Patient[] = [
  { id: 'patient-1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: 'patient-2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 'patient-3', name: 'Peter Jones', email: 'peter.jones@example.com' },
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
];
