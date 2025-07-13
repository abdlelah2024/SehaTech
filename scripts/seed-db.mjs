
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import 'dotenv/config'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mock data (copied from the old mock-data.ts)
import { subDays, set } from 'date-fns';

const now = new Date(2025, 6, 13, 10, 30, 0); // Use a fixed date for deterministic mock data

const patientNames = [
  'أحمد الصالح', 'فاطمة الزهراء', 'خالد المصري', 'عائشة الشامي', 'يوسف العراقي',
  'نور الهاشمي', 'محمد الخالدي', 'سارة المغربي', 'علي التميمي', 'مريم الأنصاري'
];

const getPatientInitials = (name) => {
  const names = name.split(" ")
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0]?.[0] || ""
}

const mockPatients = patientNames.map((name, index) => ({
  id: `patient-${index + 1}`,
  name: name,
  dob: `${1980 + (index * 2)}-${(index % 12) + 1}-${(index % 28) + 1}`,
  gender: index % 3 === 0 ? 'ذكر' : 'أنثى',
  phone: `777-010${index + 1}`,
  address: `شارع ${index + 1}، المدينة`,
  avatarUrl: `https://placehold.co/40x40.png?text=${getPatientInitials(name)}`,
  createdAt: subDays(now, index * 10).toISOString(),
}));

const getFutureDate = (daysToAdd) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
};

const mockDoctors = [
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

const mockAppointments = [
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


const mockTransactions = [
  { id: 'txn-1', patientId: 'patient-2', patientName: mockPatients[1].name, date: subDays(now, 1).toISOString(), amount: 6000, status: 'Success', service: 'فحص جلدي' },
  { id: 'txn-2', patientId: 'patient-1', patientName: mockPatients[0].name, date: subDays(now, 5).toISOString(), amount: 7500, status: 'Success', service: 'زيارة متابعة' },
  { id: 'txn-3', patientId: 'patient-5', patientName: mockPatients[4].name, date: subDays(now, 10).toISOString(), amount: 9000, status: 'Success', service: 'أشعة سينية' },
  { id: 'txn-4', patientId: 'patient-3', patientName: mockPatients[2].name, date: subDays(now, 2).toISOString(), amount: 5000, status: 'Failed', service: 'تطعيم' },
  { id: 'txn-5', patientId: 'patient-4', patientName: mockPatients[3].name, date: subDays(now, 1).toISOString(), amount: 7500, status: 'Success', service: 'تخطيط قلب' },
  { id: 'txn-6', patientId: 'patient-6', patientName: mockPatients[5].name, date: now.toISOString(), amount: 7500, status: 'Success', service: 'استشارة' },
];

const mockUsers = [
  // The admin user is created separately below
  { id: 'user-2', name: 'سالم محمد', email: 'salem@example.com', role: 'receptionist', status: 'offline' },
  { id: 'user-3', name: 'د. إميلي كارتر', email: 'emily.carter@example.com', role: 'doctor', status: 'online' },
  { id: 'user-4', name: 'د. بنيامين لي', email: 'ben.lee@example.com', role: 'doctor', status: 'offline' },
];


async function seedCollection(collectionName, data) {
    const batch = writeBatch(db);
    const collectionRef = collection(db, collectionName);
    console.log(`Starting to seed ${collectionName}...`);
    data.forEach((item) => {
        const docRef = doc(collectionRef, item.id);
        batch.set(docRef, item);
    });

    await batch.commit();
    console.log(`Successfully seeded ${data.length} documents into ${collectionName}.`);
}

async function createAdminUser() {
    const email = "asd19082@gmail.com";
    const password = "12345678";
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Successfully created admin user:", userCredential.user.uid);
        
        // Now store the user's role in Firestore
        const userRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userRef, {
            name: "المدير المسؤول",
            email: email,
            role: "admin",
            status: "online",
        });
        console.log("Successfully created admin user document in Firestore.");

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists.');
        } else {
            console.error("Error creating admin user:", error);
        }
    }
}


async function main() {
    try {
        console.log('Starting database seeding process...');
        
        // Create the admin user first
        await createAdminUser();

        // Seed other collections
        await seedCollection('patients', mockPatients);
        await seedCollection('doctors', mockDoctors);
        await seedCollection('appointments', mockAppointments);
        await seedCollection('transactions', mockTransactions);
        await seedCollection('users', mockUsers);

        console.log('Database seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error("Error during database seeding:", error);
        process.exit(1);
    }
}

main();
