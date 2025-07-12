
export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'ذكر' | 'أنثى' | 'آخر';
  phone: string;
  address: string;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  nextAvailable: string;
  isAvailableToday: boolean;
  availability: {
    date: string;
    slots: string[];
  }[];
  servicePrice?: number;
  freeReturnDays?: number;
  availableDays?: string[];
}

export interface Appointment {
  id:string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  dateTime: string;
  status: 'Scheduled' | 'Waiting' | 'Completed' | 'Follow-up';
}

export interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Success' | 'Failed';
  service?: string;
}
