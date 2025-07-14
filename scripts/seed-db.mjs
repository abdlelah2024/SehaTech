
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'Asd19082@gmail.com';
const ADMIN_PASSWORD = '12345678';

async function main() {
  console.log('Starting database seeding...');

  try {
    // 1. Create Admin User in Auth and Firestore
    let adminUid;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = userCredential.user.uid;
      console.log(`Admin user created in Firebase Auth with UID: ${adminUid}`);

      await setDoc(doc(db, 'users', adminUid), {
        name: 'Administrator',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
      console.log('Admin user document created in Firestore.');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists in Auth. Signing in to get UID...');
        const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        adminUid = userCredential.user.uid;
        console.log(`Signed in as admin. UID: ${adminUid}`);
        
        // Ensure user document exists in Firestore
        await setDoc(doc(db, 'users', adminUid), {
            name: 'Administrator',
            email: ADMIN_EMAIL,
            role: 'admin',
            createdAt: serverTimestamp(),
        }, { merge: true }); // Merge to avoid overwriting existing data if just role needs update
        console.log('Admin user document in Firestore verified/updated.');

      } else {
        throw error;
      }
    }
    
    // Add other users
    const usersData = [
        { email: 'receptionist@sehatech.com', password: '123456', name: 'موظف استقبال', role: 'receptionist' },
        { email: 'doctor@sehatech.com', password: '123456', name: 'طبيب عام', role: 'doctor' },
    ];

    for (const userData of usersData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const uid = userCredential.user.uid;
            await setDoc(doc(db, "users", uid), {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                createdAt: serverTimestamp()
            });
            console.log(`Created user: ${userData.name}`);
        } catch(error) {
            if (error.code === 'auth/email-already-in-use') {
                 console.log(`User ${userData.email} already exists. Skipping.`);
            } else {
                console.error(`Failed to create user ${userData.email}:`, error);
            }
        }
    }


    // 2. Seed Doctors
    const doctorsData = [
      { name: 'أحمد قايد سالم', specialty: 'باطنية', servicePrice: 5000, freeReturnDays: 10, availableDays: ['السبت', 'الاثنين', 'الأربعاء'], image: 'https://placehold.co/100x100.png?text=A' },
      { name: 'فاطمة الزهراء', specialty: 'أطفال', servicePrice: 4000, freeReturnDays: 7, availableDays: ['الأحد', 'الثلاثاء', 'الخميس'], image: 'https://placehold.co/100x100.png?text=F' },
      { name: 'ياسر عبدالله', specialty: 'جلدية', servicePrice: 6000, freeReturnDays: 14, availableDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], image: 'https://placehold.co/100x100.png?text=Y' }
    ];
    
    console.log('Seeding doctors...');
    for (const doctor of doctorsData) {
        await addDoc(collection(db, 'doctors'), doctor);
    }
    console.log(`${doctorsData.length} doctors seeded.`);


    // 3. Seed Patients
    const patientsData = [
        { name: 'صالح سريع', dob: '1985-05-20', gender: 'ذكر', phone: '777123456', address: 'صنعاء، شارع تعز', createdAt: serverTimestamp() },
        { name: 'آمنة محمد', dob: '1992-11-15', gender: 'أنثى', phone: '777654321', address: 'صنعاء، شارع حده', createdAt: serverTimestamp() }
    ];

    console.log('Seeding patients...');
    for (const patient of patientsData) {
        const patientWithAvatar = {
            ...patient,
            avatarUrl: `https://placehold.co/40x40.png?text=${patient.name.charAt(0)}`
        }
        await addDoc(collection(db, 'patients'), patientWithAvatar);
    }
    console.log(`${patientsData.length} patients seeded.`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

main();

    