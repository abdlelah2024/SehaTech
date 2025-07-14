
// This script is used to seed the database with initial data.
// It is not part of the main application and should only be run once
// during the initial setup.

// To run this script, use the command: `npm run db:seed`

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import 'dotenv/config'


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

const adminUser = {
    email: 'Asd19082@gmail.com',
    password: '12345678',
    name: 'المدير العام',
    role: 'admin'
};

const doctors = [
    {
      "name": "أحمد قايد سالم",
      "specialty": "باطنية",
      "image": "https://placehold.co/100x100.png?text=A",
      "servicePrice": 5000,
      "freeReturnDays": 10,
      "availableDays": ["السبت", "الاثنين", "الأربعاء"],
      "availability": [
        { "date": "2025-07-26", "slots": ["09:00", "09:30", "11:00"] },
        { "date": "2025-07-28", "slots": ["10:00", "10:30", "11:00", "11:30"] }
      ]
    },
    {
      "name": "فاطمة علي محمد",
      "specialty": "أطفال",
      "image": "https://placehold.co/100x100.png?text=F",
      "servicePrice": 4500,
      "freeReturnDays": 14,
       "availableDays": ["الأحد", "الثلاثاء", "الخميس"],
      "availability": [
        { "date": "2025-07-27", "slots": ["14:00", "14:30", "15:00"] },
        { "date": "2025-07-29", "slots": ["09:00", "09:30"] }
      ]
    },
    {
        "name": "خالد عبدالله",
        "specialty": "جلدية",
        "image": "https://placehold.co/100x100.png?text=K",
        "servicePrice": 6000,
        "freeReturnDays": 7,
         "availableDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء"],
        "availability": [
           { "date": "2025-07-26", "slots": ["16:00", "16:30"] },
           { "date": "2025-07-27", "slots": ["16:00", "16:30", "17:00"] }
        ]
    }
];

const patients = [
    {
        name: "صالح سريع",
        dob: "1990-05-15",
        gender: "ذكر",
        phone: "777123456",
        address: "صنعاء، شارع هائل",
    },
    {
        name: "مريم قائد",
        dob: "1985-11-20",
        gender: "أنثى",
        phone: "777987654",
        address: "صنعاء، شارع الزبيري",
    },
     {
        name: "علي محسن",
        dob: "2002-01-30",
        gender: "ذكر",
        phone: "771223344",
        address: "صنعاء، الدائري",
    }
];

async function seedAdminUser() {
    console.log('Attempting to create admin user...');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
        const user = userCredential.user;
        console.log(`Admin user created in Auth with UID: ${user.uid}`);

        await setDoc(doc(db, "users", user.uid), {
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            createdAt: serverTimestamp()
        });
        console.log('Admin user document created in Firestore.');
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists in Auth. Signing in to get UID...');
            const userCredential = await signInWithEmailAndPassword(auth, adminUser.email, adminUser.password);
            console.log(`Signed in as admin. UID: ${userCredential.user.uid}`);
            return userCredential.user.uid;
        } else {
            console.error('Error creating or signing in admin user:', error);
            throw error;
        }
    }
}


async function seedCollection(collectionName, data) {
    console.log(`Seeding ${collectionName}...`);
    const collectionRef = collection(db, collectionName);
    const batch = writeBatch(db);
    const docRefs = [];

    data.forEach(item => {
        const docRef = doc(collectionRef); 
        const newItem = {
            ...item,
            ...(collectionName === 'patients' && { createdAt: serverTimestamp() }),
            ...(collectionName === 'patients' && { avatarUrl: `https://placehold.co/40x40.png?text=${item.name.charAt(0)}`})
        };
        batch.set(docRef, newItem);
        docRefs.push({ id: docRef.id, ...newItem });
    });

    await batch.commit();
    console.log(`${collectionName} seeded successfully.`);
    return docRefs;
}

async function seedAppointments(seededPatients, seededDoctors) {
    if (seededPatients.length === 0 || seededDoctors.length === 0) {
        console.log("Skipping appointment seeding due to missing patient or doctor data.");
        return;
    }

    const appointments = [
        {
            patient: seededPatients[0],
            doctor: seededDoctors[0],
            dateTime: new Date(2025, 6, 31, 9, 0).toISOString(),
            status: 'Scheduled',
        },
        {
            patient: seededPatients[1],
            doctor: seededDoctors[1],
            dateTime: new Date(2025, 6, 29, 14, 30).toISOString(),
            status: 'Completed',
        },
         {
            patient: seededPatients[0],
            doctor: seededDoctors[0],
            dateTime: new Date(2025, 6, 14, 16, 19).toISOString(),
            status: 'Completed',
        }
    ];

    const batch = writeBatch(db);
    const appointmentsRef = collection(db, "appointments");

    appointments.forEach(appt => {
        const docRef = doc(appointmentsRef);
        batch.set(docRef, {
            patientId: appt.patient.id,
            patientName: appt.patient.name,
            doctorId: appt.doctor.id,
            doctorName: `د. ${appt.doctor.name}`,
            doctorSpecialty: appt.doctor.specialty,
            dateTime: appt.dateTime,
            status: appt.status,
        });
    });

    await batch.commit();
    console.log("Appointments seeded successfully.");
}


async function main() {
    console.log('--- Starting Database Seeding ---');
    await seedAdminUser();
    const seededDoctors = await seedCollection('doctors', doctors);
    const seededPatients = await seedCollection('patients', patients);
    await seedAppointments(seededPatients, seededDoctors);
    console.log('--- Database Seeding Complete ---');
}

main().catch(e => {
    console.error("An error occurred during seeding:", e);
}).finally(() => {
    // Exit the process
    process.exit();
});
