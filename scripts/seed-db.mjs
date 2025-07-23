/**
 * @fileoverview Seeds the Firestore database with initial data.
 *
 * This script is intended to be run from the command line, e.g., `node scripts/seed-db.mjs`.
 * It requires a service account key file (`serviceAccountKey.json`) in the same directory
 * to authenticate with Firebase Admin.
 *
 * It performs the following actions:
 * 1. Initializes the Firebase Admin SDK.
 * 2. Deletes all existing data from specified collections to ensure a clean slate.
 * 3. Creates new user records in Firebase Authentication.
 * 4. Creates corresponding user documents in the 'users' collection in Firestore.
 * 5. Seeds the 'doctors', 'patients', 'appointments', 'transactions', and 'inboxMessages' collections with sample data.
 */
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { fakerAR as faker } from '@faker-js/faker';

// --- Configuration ---
// IMPORTANT: Place your Firebase service account key file in the same directory and name it `serviceAccountKey.json`.
const SERVICE_ACCOUNT_PATH = new URL('./serviceAccountKey.json', import.meta.url);

async function initializeFirebase() {
  try {
    const serviceAccount = JSON.parse(await readFile(SERVICE_ACCOUNT_PATH, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://sehatech-519pg-default-rtdb.firebaseio.com`,
    });
    console.log('Firebase Admin SDK initialized successfully.');
    return {
      db: getFirestore(),
      auth: getAuth(),
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(
        'Error: `serviceAccountKey.json` not found.'
      );
      console.error(
        `Please download it from your Firebase project settings (Project settings > Service accounts > Generate new private key) and place it at: ${SERVICE_ACCOUNT_PATH}`
      );
    } else {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
    process.exit(1);
  }
}

async function deleteCollection(db, collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve();
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}


async function clearAllData(db, auth) {
    console.log('Starting data cleanup...');

    const collections = ['users', 'doctors', 'patients', 'appointments', 'transactions', 'auditLogs', 'inboxMessages', 'conversations'];
    for (const collection of collections) {
        console.log(`Deleting collection: ${collection}...`);
        await deleteCollection(db, collection);
    }
    
    console.log('Deleting all Firebase Auth users...');
    const listUsersResult = await auth.listUsers(1000);
    const uidsToDelete = listUsersResult.users.map(u => u.uid);
    if (uidsToDelete.length > 0) {
        await auth.deleteUsers(uidsToDelete);
        console.log(`Successfully deleted ${uidsToDelete.length} users.`);
    } else {
        console.log('No auth users to delete.');
    }

    console.log('Cleanup complete.');
}


async function seedDatabase(db, auth) {
    console.log('Starting database seeding...');
    
    // 1. Create Users in Auth and Firestore
    const usersData = [
        { email: 'abdlelah2013@gmail.com', password: '123456', name: 'عبدالإله القدسي', role: 'admin' },
        { email: 'reception@sehatech.com', password: '123456', name: 'موظف استقبال', role: 'receptionist' },
        { email: 'doctor@sehatech.com', password: '123456', name: 'طبيب عام', role: 'doctor' },
    ];
    
    const users = {};
    for (const userData of usersData) {
        try {
            const userRecord = await auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.name,
            });
            users[userData.role] = { id: userRecord.uid, ...userData };
            
            const userDocRef = db.collection('users').doc(userRecord.uid);
            await userDocRef.set({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Created user: ${userData.name} (${userData.role})`);
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                 console.warn(`User with email ${userData.email} already exists. Skipping Auth creation.`);
                 const userRecord = await auth.getUserByEmail(userData.email);
                 users[userData.role] = { id: userRecord.uid, ...userData };
            } else {
                throw error;
            }
        }
    }
     // Setup contacts
    const adminId = users.admin.id;
    const receptionistId = users.receptionist.id;
    const doctorId = users.doctor.id;

    await db.collection('users').doc(adminId).set({ contacts: { [receptionistId]: true, [doctorId]: true } }, { merge: true });
    await db.collection('users').doc(receptionistId).set({ contacts: { [adminId]: true, [doctorId]: true } }, { merge: true });
    await db.collection('users').doc(doctorId).set({ contacts: { [adminId]: true, [receptionistId]: true } }, { merge: true });

    // 2. Seed Doctors
    const doctors = [
        { name: 'علي الأحمد', specialty: 'أمراض القلب', servicePrice: 7000, freeReturnDays: 14, availableDays: ['الأحد', 'الثلاثاء', 'الخميس'] },
        { name: 'فاطمة الزهراء', specialty: 'الأطفال', servicePrice: 5000, freeReturnDays: 10, availableDays: ['السبت', 'الاثنين', 'الأربعاء'] },
        { name: 'خالد المصري', specialty: 'الجلدية', servicePrice: 6000, freeReturnDays: 7, availableDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'] },
    ];

    const doctorIds = [];
    for (const docData of doctors) {
        const docRef = await db.collection('doctors').add({
            ...docData,
            image: `https://placehold.co/100x100.png?text=${docData.name.charAt(0)}`,
            nextAvailable: 'غداً، 10:00 ص',
            isAvailableToday: Math.random() > 0.5,
            availability: [
                { date: '2024-08-01', slots: ['10:00', '11:00', '14:00'] },
                { date: '2024-08-02', slots: ['09:00', '10:00', '11:00', '12:00'] }
            ]
        });
        doctorIds.push({ id: docRef.id, ...docData });
        console.log(`Created doctor: ${docData.name}`);
    }
    
    // 3. Seed Patients
    const patients = [];
    for (let i = 0; i < 15; i++) {
        const name = faker.person.fullName();
        const patientData = {
            name: name,
            dob: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
            gender: faker.person.sex() === 'female' ? 'أنثى' : 'ذكر',
            phone: faker.phone.number(),
            address: `${faker.location.city()}, ${faker.location.streetAddress()}`,
            avatarUrl: `https://placehold.co/40x40.png?text=${name.charAt(0)}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const patientRef = await db.collection('patients').add(patientData);
        patients.push({ id: patientRef.id, ...patientData });
        console.log(`Created patient: ${patientData.name}`);
    }

    // 4. Seed Appointments
    for (let i = 0; i < 25; i++) {
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const doctor = doctorIds[Math.floor(Math.random() * doctorIds.length)];
        const statuses = ['Scheduled', 'Waiting', 'Completed', 'Follow-up'];
        const appointmentData = {
            patientId: patient.id,
            patientName: patient.name,
            doctorId: doctor.id,
            doctorName: `د. ${doctor.name}`,
            doctorSpecialty: doctor.specialty,
            dateTime: faker.date.recent({ days: 30 }).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
        };
        await db.collection('appointments').add(appointmentData);
    }
    console.log('Created 25 appointments.');

    // 5. Seed Transactions (based on completed appointments)
    const completedAppointments = await db.collection('appointments').where('status', '==', 'Completed').get();
    for (const doc of completedAppointments.docs) {
        const appointment = doc.data();
        const doctor = doctorIds.find(d => d.id === appointment.doctorId);
        if (doctor && doctor.servicePrice) {
            await db.collection('transactions').add({
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                date: admin.firestore.Timestamp.fromDate(new Date(appointment.dateTime)),
                amount: doctor.servicePrice,
                status: 'Success',
                service: `${doctor.specialty} Consultation`,
            });
        }
    }
    console.log(`Created ${completedAppointments.size} transactions.`);
    
    // 6. Seed Inbox Messages
    const inboxMessages = [
        { from: 'نظام صحة تك', fromId: 'system', title: 'أهلاً بك في صحة تك!', content: 'مرحباً بك في نظام إدارة العيادات الذكي. نحن هنا لمساعدتك على تنظيم عملك بفعالية.', read: false },
        { from: 'فريق الدعم', fromId: 'support', title: 'تحديثات جديدة في النظام', content: 'لقد قمنا بإضافة ميزات جديدة لتحسين تجربتك، بما في ذلك الدردشة المباشرة والتقارير المتقدمة.', read: true },
    ];

    for (const msg of inboxMessages) {
        await db.collection('inboxMessages').add({
            ...msg,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    console.log('Seeded inbox messages.');

    console.log('Database seeding completed successfully.');
}

async function main() {
  const { db, auth } = await initializeFirebase();
  await clearAllData(db, auth);
  await seedDatabase(db, auth);
}

main().catch((e) => console.error(e));
