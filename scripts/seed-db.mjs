
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import 'dotenv/config';

// --- Configuration ---
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const ADMIN_EMAIL = 'abdlelah2013@gmail.com';
const ADMIN_PASSWORD = '123456';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Functions ---
async function findUserByEmail(email) {
  // This is a workaround as Admin SDK is not available client-side
  // It tries to sign in to check if user exists.
  try {
    await signInWithEmailAndPassword(auth, email, 'anyrandompassword');
    return true; // User exists
  } catch (error) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      return false; // User does not exist
    }
    // Rethrow other errors
    throw error;
  }
}

// --- Main Seeding Logic ---
async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // 1. Create or verify Admin User
    let adminUid;
    const adminExists = await findUserByEmail(ADMIN_EMAIL);
    
    if (!adminExists) {
      console.log(`Admin user ${ADMIN_EMAIL} not found. Creating...`);
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = userCredential.user.uid;
      console.log(`Admin user created with UID: ${adminUid}`);
    } else {
      console.log(`Admin user ${ADMIN_EMAIL} already exists. Signing in to get UID...`);
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = userCredential.user.uid;
      console.log(`Signed in as admin. UID: ${adminUid}`);
    }
    
    const batch = writeBatch(db);

    // 2. Add Admin to 'users' collection
    const adminUserDocRef = doc(db, 'users', adminUid);
    batch.set(adminUserDocRef, {
      name: 'المدير العام',
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: serverTimestamp(),
    });
    console.log('Admin user data prepared for Firestore.');

    // 3. Seed Doctors
    const doctorsData = [
       { id: 'doc1', name: 'أحمد قايد سالم', specialty: 'باطنية', image: `https://placehold.co/100x100.png?text=A`, servicePrice: 5000, freeReturnDays: 14, availableDays: ['الأحد', 'الثلاثاء', 'الخميس'], availability: [{ date: '2025-07-28', slots: ['09:00', '10:00', '11:00'] }] },
       { id: 'doc2', name: 'فاطمة الزهراء', specialty: 'أطفال', image: `https://placehold.co/100x100.png?text=F`, servicePrice: 4500, freeReturnDays: 10, availableDays: ['السبت', 'الاثنين', 'الأربعاء'], availability: [{ date: '2025-07-29', slots: ['14:00', '15:00'] }] },
       { id: 'doc3', name: 'علي محمد', specialty: 'جلدية', image: `https://placehold.co/100x100.png?text=A`, servicePrice: 6000, freeReturnDays: 7, availableDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], availability: [] },
    ];
    doctorsData.forEach(doctor => {
        const docRef = doc(db, 'doctors', doctor.id);
        batch.set(docRef, doctor);
    });
    console.log(`${doctorsData.length} doctors prepared for seeding.`);
    
    // 4. Seed Patients
    const patientsData = [
       { id: 'pat1', name: 'صالح سريع', dob: '1988-05-20', gender: 'ذكر', phone: '777123456', address: 'صنعاء، شارع تعز', avatarUrl: `https://placehold.co/40x40.png?text=SS`, createdAt: serverTimestamp() },
       { id: 'pat2', name: 'مريم عبدالله', dob: '1995-11-10', gender: 'أنثى', phone: '777654321', address: 'صنعاء، شارع حده', avatarUrl: `https://placehold.co/40x40.png?text=MA`, createdAt: serverTimestamp() },
    ];
    patientsData.forEach(patient => {
        const docRef = doc(db, 'patients', patient.id);
        batch.set(docRef, patient);
    });
    console.log(`${patientsData.length} patients prepared for seeding.`);
    
    // 5. Seed Appointments
    const appointmentsData = [
        { patientId: 'pat1', patientName: 'صالح سريع', doctorId: 'doc1', doctorName: 'د. أحمد قايد سالم', doctorSpecialty: 'باطنية', dateTime: new Date().toISOString(), status: 'Waiting' },
        { patientId: 'pat2', patientName: 'مريم عبدالله', doctorId: 'doc2', doctorName: 'د. فاطمة الزهراء', doctorSpecialty: 'أطفال', dateTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), status: 'Scheduled' },
    ];
    appointmentsData.forEach(appointment => {
        const docRef = doc(collection(db, 'appointments')); // Auto-generate ID
        batch.set(docRef, appointment);
    });
    console.log(`${appointmentsData.length} appointments prepared for seeding.`);
    
    // 6. Seed other users
    const otherUsers = [
        { uid: 'user-receptionist-1', email: 'reception@clinic.com', pass: '123456', data: { name: 'موظف استقبال', role: 'receptionist'} },
        { uid: 'user-doctor-1', email: 'doctor.ahmed@clinic.com', pass: '123456', data: { name: 'د. أحمد قايد سالم', role: 'doctor' } }
    ];

    for (const user of otherUsers) {
        const userExists = await findUserByEmail(user.email);
        let finalUid = user.uid;
        if (!userExists) {
            const cred = await createUserWithEmailAndPassword(auth, user.email, user.pass);
            finalUid = cred.user.uid;
            console.log(`Created user ${user.email}`);
        }
        const userDocRef = doc(db, 'users', finalUid);
        batch.set(userDocRef, { ...user.data, email: user.email, createdAt: serverTimestamp() });
    }
    console.log(`${otherUsers.length} other users prepared for seeding.`);


    // Commit the batch
    await batch.commit();
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    if (error.code === 'auth/email-already-in-use') {
        console.error("One of the users already exists. Please clear users from Firebase Authentication console and try again.");
    }
  }
}

seedDatabase().then(() => {
  console.log('Seeding process finished.');
  process.exit(0);
}).catch(err => {
  console.error("Seeding process failed.", err);
  process.exit(1);
});
