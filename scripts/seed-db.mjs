
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: './.env' });
config({ path: './src/.env' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

const getPatientInitials = (name) => {
  const names = name.split(" ")
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0]?.[0] || ""
}

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing users
    const listUsersResult = await auth.listUsers(1000);
    const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      console.log('Successfully deleted existing users.');
    } else {
      console.log('No existing users to delete.');
    }
  } catch (error) {
    console.error('Error deleting users:', error);
  }

  // Clear Firestore collections
  const collections = ['users', 'patients', 'doctors', 'appointments', 'transactions', 'conversations', 'auditLogs'];
  for (const collectionName of collections) {
    console.log(`Clearing collection: ${collectionName}`);
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty.`);
        continue;
    }
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully cleared collection: ${collectionName}`);
  }


  // --- Create Users ---
  console.log('Creating users...');
  const usersToCreate = [
    { email: 'abdlelah2013@gmail.com', password: '123456', displayName: 'عبدالإله القدسي', role: 'admin' },
    { email: 'receptionist@sehatech.com', password: '123456', displayName: 'فاطمة الزهراء', role: 'receptionist' },
    { email: 'doctor@sehatech.com', password: '123456', displayName: 'أحمد قايد سالم', role: 'doctor' },
  ];

  const userRecords = {};

  for (const userData of usersToCreate) {
    try {
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });
      console.log(`Successfully created user: ${userRecord.email}`);
      userRecords[userData.role] = userRecord;

      // Add user to Firestore 'users' collection
      await db.collection('users').doc(userRecord.uid).set({
        name: userData.displayName,
        email: userData.email,
        role: userData.role,
        createdAt: Timestamp.now(),
      });
       console.log(`Added ${userData.displayName} to Firestore users collection.`);

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.warn(`User with email ${userData.email} already exists. Skipping creation.`);
        const existingUser = await auth.getUserByEmail(userData.email);
        userRecords[userData.role] = existingUser;
        // Ensure user is in firestore
         await db.collection('users').doc(existingUser.uid).set({
            name: userData.displayName,
            email: userData.email,
            role: userData.role,
            createdAt: Timestamp.now(),
        }, { merge: true });

      } else {
        console.error('Error creating user:', error);
      }
    }
  }
   console.log('Finished creating users.');

  // --- Create Doctors ---
  console.log('Creating doctors...');
  const doctorsToCreate = [
    { name: 'أحمد قايد سالم', specialty: 'باطنية', servicePrice: 5000, freeReturnDays: 14, availability: [], availableDays: ['السبت', 'الاثنين', 'الأربعاء'] },
    { name: 'علي محمد عبدالله', specialty: 'أطفال', servicePrice: 4000, freeReturnDays: 10, availability: [], availableDays: ['الأحد', 'الثلاثاء', 'الخميس'] },
    { name: 'سارة يوسف', specialty: 'جلدية', servicePrice: 6000, freeReturnDays: 7, availability: [], availableDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'] },
  ];
  
  const doctorDocs = [];
  for (const doctorData of doctorsToCreate) {
      const docRef = await db.collection('doctors').add({
          ...doctorData,
          image: `https://placehold.co/100x100.png?text=${getPatientInitials(doctorData.name)}`
      });
      doctorDocs.push({id: docRef.id, ...doctorData});
      console.log(`Created doctor: ${doctorData.name}`);
  }
  console.log('Finished creating doctors.');


  // --- Create Patients ---
  console.log('Creating patients...');
  const patientsToCreate = [
    { name: 'صالح سريع', dob: '1985-05-20', gender: 'ذكر', phone: '777123456', address: 'صنعاء، شارع حده' },
    { name: 'مريم قائد', dob: '1992-11-10', gender: 'أنثى', phone: '777654321', address: 'صنعاء، شارع الزبيري' },
    { name: 'خالد المصري', dob: '1978-02-15', gender: 'ذكر', phone: '777987654', address: 'صنعاء، شارع تعز' },
  ];

  const patientDocs = [];
  for(const patientData of patientsToCreate) {
    const docRef = await db.collection('patients').add({
        ...patientData,
        avatarUrl: `https://placehold.co/40x40.png?text=${getPatientInitials(patientData.name)}`,
        createdAt: Timestamp.now()
    });
    patientDocs.push({id: docRef.id, ...patientData});
    console.log(`Created patient: ${patientData.name}`);
  }
   console.log('Finished creating patients.');


  // --- Create Appointments ---
   console.log('Creating appointments...');
   const appointmentsToCreate = [
       { patientIndex: 0, doctorIndex: 0, status: 'Completed', date: new Date() },
       { patientIndex: 1, doctorIndex: 1, status: 'Scheduled', date: new Date(new Date().setDate(new Date().getDate() + 1))},
       { patientIndex: 2, doctorIndex: 2, status: 'Waiting', date: new Date() }
   ];

   for(const appData of appointmentsToCreate) {
       const patient = patientDocs[appData.patientIndex];
       const doctor = doctorDocs[appData.doctorIndex];
       await db.collection('appointments').add({
           patientId: patient.id,
           patientName: patient.name,
           doctorId: doctor.id,
           doctorName: `د. ${doctor.name}`,
           doctorSpecialty: doctor.specialty,
           dateTime: appData.date.toISOString(),
           status: appData.status,
       });
       console.log(`Created appointment for ${patient.name} with Dr. ${doctor.name}`);
   }
   console.log('Finished creating appointments.');


  console.log('Database seeding completed successfully!');
}

seedDatabase().catch(console.error);
