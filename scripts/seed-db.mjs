
import {initializeApp} from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import {getDatabase, ref, set} from 'firebase/database';
import {config} from 'dotenv';

config({path: '.env.local'});

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
const rtdb = getDatabase(app);

const getPatientInitials = name => {
  if (!name) return '';
  const names = name.split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0]?.[0] || '';
};

// --- Data Definitions ---

const users = [
  {
    email: 'abdlelah2013@gmail.com',
    password: '123456',
    name: 'عبدالإله القدسي',
    role: 'admin',
  },
  {
    email: 'doctor.ali@example.com',
    password: 'password123',
    name: 'علي محسن',
    role: 'doctor',
  },
  {
    email: 'reception.sara@example.com',
    password: 'password123',
    name: 'سارة عبدالله',
    role: 'receptionist',
  },
];

const doctors = [
  {
    name: 'أحمد محمود',
    specialty: 'أمراض القلب',
    image: `https://placehold.co/100x100.png?text=أ`,
    nextAvailable: 'غداً، 10:00 ص',
    isAvailableToday: true,
    servicePrice: 7000,
    freeReturnDays: 14,
    availableDays: ['السبت', 'الاثنين', 'الأربعاء'],
    availability: [
      {date: '2024-07-20', slots: ['10:00', '11:00', '12:00']},
      {date: '2024-07-22', slots: ['09:00', '10:00', '11:00']},
    ],
  },
  {
    name: 'فاطمة الزهراء',
    specialty: 'طب الأطفال',
    image: `https://placehold.co/100x100.png?text=ف`,
    nextAvailable: 'اليوم، 04:00 م',
    isAvailableToday: true,
    servicePrice: 5000,
    freeReturnDays: 10,
    availableDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    availability: [
      {date: '2024-07-21', slots: ['16:00', '17:00', '18:00']},
      {date: '2024-07-23', slots: ['15:00', '16:00', '17:00']},
    ],
  },
  {
    name: 'يوسف إبراهيم',
    specialty: 'الجلدية',
    image: `https://placehold.co/100x100.png?text=ي`,
    nextAvailable: 'بعد 3 أيام',
    isAvailableToday: false,
    servicePrice: 6000,
    freeReturnDays: 14,
    availableDays: ['الأحد', 'الثلاثاء'],
    availability: [],
  },
  {
    name: 'مريم علي',
    specialty: 'النساء والتوليد',
    image: `https://placehold.co/100x100.png?text=م`,
    nextAvailable: 'غداً، 09:00 ص',
    isAvailableToday: true,
    servicePrice: 8000,
    availableDays: ['السبت', 'الاثنين', 'الخميس'],
    availability: [],
  },
];

const patients = [
  {
    name: 'خالد صالح',
    dob: '1985-05-20',
    gender: 'ذكر',
    phone: '777123456',
    address: 'صنعاء, شارع حدة',
  },
  {
    name: 'نورة عبدالله',
    dob: '1992-11-10',
    gender: 'أنثى',
    phone: '777654321',
    address: 'عدن, المعلا',
  },
  {
    name: 'سامي أحمد',
    dob: '2018-01-15',
    gender: 'ذكر',
    phone: '777987654',
    address: 'تعز, شارع جمال',
  },
];

const inboxMessages = [
    {
      from: 'فريق صحة تك',
      title: 'مرحباً بك في نظام صحة تك!',
      content: 'نحن سعداء بانضمامك إلى نظامنا. يمكنك الآن إدارة عيادتك بكل سهولة. لا تتردد في استكشاف جميع الميزات!',
      read: false,
    },
     {
      from: 'تحديثات النظام',
      title: 'تم تفعيل ميزات جديدة!',
      content: 'لقد قمنا بإضافة ميزة الدردشة الفورية وحالة المستخدمين. يمكنك الآن التواصل مع فريقك مباشرة من لوحة التحكم.',
      read: true,
    }
]


async function clearCollection(collectionPath) {
  const collectionRef = collection(db, collectionPath);
  const q = await getDocs(collectionRef);
  const batch = writeBatch(db);
  q.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Collection "${collectionPath}" cleared.`);
}

async function seedCollection(collectionName, data) {
  const batch = writeBatch(db);
  const collectionRef = collection(db, collectionName);
  const addedDocs = [];

  data.forEach(item => {
    const docRef = doc(collectionRef); // Automatically generate unique ID
    if (collectionName === 'patients' || collectionName === 'users') {
      item.createdAt = serverTimestamp();
    }
     if (collectionName === 'patients') {
        item.avatarUrl = `https://placehold.co/40x40.png?text=${getPatientInitials(item.name)}`;
    }
    if (collectionName === 'transactions' || collectionName === 'inboxMessages') {
        item.timestamp = serverTimestamp();
    }
     if (collectionName === 'transactions') {
        item.date = serverTimestamp();
    }
    batch.set(docRef, item);
    addedDocs.push({id: docRef.id, ...item});
  });

  await batch.commit();
  console.log(`Seeded ${data.length} documents into ${collectionName}`);
  return addedDocs;
}

async function seedUsers() {
  const addedUsers = [];

  for (const userData of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const user = userCredential.user;
      console.log(`Created auth user: ${user.email}`);

      const userDocData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: serverTimestamp(),
        contacts: {} // Add empty contacts object
      };
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
      console.log(`Firestore document created for user: ${user.email}`);

      addedUsers.push({id: user.uid, ...userDocData});
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User ${userData.email} already exists. Signing in to get UID.`);
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCredential.user;
         const userDocData = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: serverTimestamp(),
          contacts: {}
        };
        await setDoc(doc(db, 'users', user.uid), userDocData, { merge: true }); // Merge to avoid overwriting existing data
        console.log(`Firestore document updated for user: ${user.email}`);
        addedUsers.push({id: user.uid, ...userDocData});
      } else {
        console.error('Error creating user:', error);
      }
    }
  }

  // Set contacts
  const allUsersQuery = await getDocs(collection(db, 'users'));
  const allUsers = allUsersQuery.docs.map(d => ({ id: d.id, ...d.data()}));
  
  if (allUsers.length > 1) {
    const batch = writeBatch(db);
    allUsers.forEach(user => {
        const userRef = doc(db, 'users', user.id);
        const contacts = {};
        allUsers.forEach(otherUser => {
            if (user.id !== otherUser.id) {
                contacts[otherUser.id] = true;
            }
        });
        batch.update(userRef, { contacts });
    });
    await batch.commit();
    console.log("Contacts set for all users.");
  }


  return addedUsers;
}


async function main() {
  console.log('Starting database seed...');

  // --- Clear existing data ---
  await clearCollection('appointments');
  await clearCollection('transactions');
  await clearCollection('patients');
  await clearCollection('doctors');
  await clearCollection('inboxMessages');
  
  // Note: We don't clear users or auditLogs automatically to prevent data loss.
  // We'll manage users individually.
  
  // --- Seed new data ---
  const seededUsers = await seedUsers();
  const seededDoctors = await seedCollection('doctors', doctors);
  const seededPatients = await seedCollection('patients', patients);

  // --- Seed linked data ---
  if (seededPatients.length > 0 && seededDoctors.length > 0) {
    const appointmentsToSeed = [
      {
        patientId: seededPatients[0].id,
        patientName: seededPatients[0].name,
        doctorId: seededDoctors[0].id,
        doctorName: `د. ${seededDoctors[0].name}`,
        doctorSpecialty: seededDoctors[0].specialty,
        dateTime: new Date().toISOString(),
        status: 'Waiting',
      },
      {
        patientId: seededPatients[1].id,
        patientName: seededPatients[1].name,
        doctorId: seededDoctors[1].id,
        doctorName: `د. ${seededDoctors[1].name}`,
        doctorSpecialty: seededDoctors[1].specialty,
        dateTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'Scheduled',
      },
       {
        patientId: seededPatients[0].id,
        patientName: seededPatients[0].name,
        doctorId: seededDoctors[1].id,
        doctorName: `د. ${seededDoctors[1].name}`,
        doctorSpecialty: seededDoctors[1].specialty,
        dateTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        status: 'Completed',
      },
    ];
    const seededAppointments = await seedCollection('appointments', appointmentsToSeed);

    const completedAppointment = seededAppointments.find(a => a.status === 'Completed');
    if (completedAppointment) {
        const doctorForTransaction = seededDoctors.find(d => d.id === completedAppointment.doctorId);
        if (doctorForTransaction && doctorForTransaction.servicePrice) {
            const transactionsToSeed = [
                {
                    patientId: completedAppointment.patientId,
                    patientName: completedAppointment.patientName,
                    amount: doctorForTransaction.servicePrice,
                    status: 'Success',
                    service: `${doctorForTransaction.specialty} Consultation`,
                }
            ];
            await seedCollection('transactions', transactionsToSeed);
        }
    }
  }

  // Seed Inbox Messages
  if (seededUsers.length > 0) {
      const adminUser = seededUsers.find(u => u.role === 'admin');
      if (adminUser) {
          const messagesWithFromId = inboxMessages.map(msg => ({...msg, fromId: adminUser.id}));
          await seedCollection('inboxMessages', messagesWithFromId);
      }
  }


  console.log('Database seeded successfully!');
  // The script will exit automatically.
  process.exit(0);
}

main().catch(error => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

