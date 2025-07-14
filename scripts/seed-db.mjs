
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);

const doctors = [
  { 
    name: 'أحمد قايد سالم', 
    specialty: 'باطنية', 
    image: 'https://placehold.co/100x100.png', 
    servicePrice: 5000, 
    freeReturnDays: 14, 
    availableDays: ['السبت', 'الاثنين', 'الأربعاء'], 
    isAvailableToday: true, 
    nextAvailable: 'غداً، 10:00 ص',
    availability: [
      { date: '2025-07-15', slots: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30'] },
      { date: '2025-07-16', slots: ['09:00', '09:30', '12:00', '12:30', '15:00'] }
    ]
  },
  { 
    name: 'فاطمة الزهراء علي', 
    specialty: 'أطفال', 
    image: 'https://placehold.co/100x100.png',
    servicePrice: 4000, 
    freeReturnDays: 10, 
    availableDays: ['الأحد', 'الثلاثاء', 'الخميس'], 
    isAvailableToday: false, 
    nextAvailable: 'بعد غد، 9:00 ص',
    availability: [
      { date: '2025-07-16', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'] }
    ]
  },
];

const patients = [
  { name: 'علي محمد أحمد', dob: '1985-05-20', gender: 'ذكر', phone: '777123456', address: 'صنعاء، شارع تعز', avatarUrl: 'https://placehold.co/40x40.png' },
  { name: 'نورة عبدالله صالح', dob: '1992-11-10', gender: 'أنثى', phone: '777654321', address: 'صنعاء، شارع حده', avatarUrl: 'https://placehold.co/40x40.png' },
];

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // 1. Create Admin User in Auth and Firestore
    console.log('Creating admin user...');
    const adminEmail = 'Asd19082@gmail.com';
    const adminPassword = '12345678';
    
    let adminUid;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      adminUid = userCredential.user.uid;
      console.log(`Successfully created admin user in Auth with UID: ${adminUid}`);
      
      await setDoc(doc(db, "users", adminUid), {
        name: 'المدير العام',
        email: adminEmail,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
      console.log('Successfully created admin user in Firestore.');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.warn('Admin user already exists in Auth. Skipping creation.');
        // If you need to get the UID of the existing user, you'd have to do that differently,
        // but for seeding, we can assume if it exists, the Firestore doc also exists.
      } else {
        throw error; // Re-throw other errors
      }
    }


    // 2. Seed Doctors
    console.log('Seeding doctors...');
    const doctorRefs = [];
    for (const doctor of doctors) {
      const docRef = await addDoc(collection(db, "doctors"), doctor);
      doctorRefs.push({ id: docRef.id, ...doctor });
      console.log(`Added doctor: ${doctor.name}`);
    }

    // 3. Seed Patients
    console.log('Seeding patients...');
    const patientRefs = [];
    for (const patient of patients) {
      const docRef = await addDoc(collection(db, "patients"), { ...patient, createdAt: serverTimestamp() });
      patientRefs.push({ id: docRef.id, ...patient });
      console.log(`Added patient: ${patient.name}`);
    }
    
    // 4. Seed Appointments
    console.log('Seeding appointments...');
    if (patientRefs.length > 0 && doctorRefs.length > 0) {
        const appointment1 = {
            patientId: patientRefs[0].id,
            patientName: patientRefs[0].name,
            doctorId: doctorRefs[0].id,
            doctorName: `د. ${doctorRefs[0].name}`,
            doctorSpecialty: doctorRefs[0].specialty,
            dateTime: new Date().toISOString(),
            status: 'Waiting',
        };
        await addDoc(collection(db, "appointments"), appointment1);
        console.log(`Added appointment for ${patientRefs[0].name}`);

        const appointment2 = {
            patientId: patientRefs[1].id,
            patientName: patientRefs[1].name,
            doctorId: doctorRefs[1].id,
            doctorName: `د. ${doctorRefs[1].name}`,
            doctorSpecialty: doctorRefs[1].specialty,
            dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            status: 'Scheduled',
        };
        await addDoc(collection(db, "appointments"), appointment2);
        console.log(`Added appointment for ${patientRefs[1].name}`);
    }

    // 5. Seed Transactions
    console.log('Seeding transactions...');
     if (patientRefs.length > 0 && doctorRefs.length > 0) {
        const transaction1 = {
            patientId: patientRefs[0].id,
            patientName: patientRefs[0].name,
            date: serverTimestamp(),
            amount: doctorRefs[0].servicePrice,
            status: 'Success',
            service: `${doctorRefs[0].specialty} Consultation`
        };
        await addDoc(collection(db, "transactions"), transaction1);
        console.log(`Added transaction for ${patientRefs[0].name}`);
     }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
