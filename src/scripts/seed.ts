import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient, PatientGender, PatientStatus } from '../models/Patient.js';

dotenv.config();

const sampleDoctors = [
  {
    name: 'Dr. Tanvir Ahmed',
    specialization: 'Cardiology',
    hospital: 'Evercare Hospital Dhaka',
    phone: '+880 1711-234567',
    email: 'tanvir.ahmed@evercare.org',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
  },
  {
    name: 'Dr. Nusrat Jahan',
    specialization: 'Cardiology',
    hospital: 'Square Hospital',
    phone: '+880 1712-345678',
    email: 'nusrat.jahan@squarehospital.com',
    createdAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Farhan Kabir',
    specialization: 'Neurology',
    hospital: 'United Hospital Limited',
    phone: '+880 1713-456789',
    email: 'farhan.kabir@unitedhospital.com.bd',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Salma Khatun',
    specialization: 'Neurology',
    hospital: 'National Institute of Neurosciences',
    phone: '+880 1714-567890',
    email: 'salma.khatun@nins.gov.bd',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Mahmudul Hasan',
    specialization: 'Pediatrics',
    hospital: 'Dhaka Shishu (Children) Hospital',
    phone: '+880 1715-678901',
    email: 'm.hasan@dhakashishu.org',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Rupa Chowdhury',
    specialization: 'Pediatrics',
    hospital: 'Popular Diagnostic & Hospital',
    phone: '+880 1716-789012',
    email: 'rupa.chowdhury@popular.com.bd',
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Ariful Islam',
    specialization: 'Orthopedics',
    hospital: 'NITOR (Pongu Hospital)',
    phone: '+880 1717-890123',
    email: 'ariful.islam@nitor.gov.bd',
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Sabina Yasmin',
    specialization: 'Orthopedics',
    hospital: 'Square Hospital',
    phone: '+880 1718-901234',
    email: 'sabina.yasmin@squarehospital.com',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Zahirul Haque',
    specialization: 'Oncology',
    hospital: 'National Institute of Cancer Research',
    phone: '+880 1719-012345',
    email: 'zahirul.haque@nicrh.gov.bd',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Mehreen Rahman',
    specialization: 'Oncology',
    hospital: 'Evercare Hospital Dhaka',
    phone: '+880 1720-123456',
    email: 'mehreen.rahman@evercare.org',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Kamrul Zaman',
    specialization: 'Dermatology',
    hospital: 'Labaid Specialized Hospital',
    phone: '+880 1721-234567',
    email: 'kamrul.zaman@labaidgroup.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Dr. Shanjida Akter',
    specialization: 'Dermatology',
    hospital: 'Ibn Sina Specialized Hospital',
    phone: '+880 1722-345678',
    email: 'shanjida.akter@ibnsina.com.bd',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

interface RawPatientTemplate {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  status: PatientStatus;
  daysAgo: number;
  notes?: string;
}

const rawPatients: RawPatientTemplate[] = [
  { name: 'Rafiqul Islam', age: 58, gender: 'Male', phone: '+880 1812-111001', condition: 'Hypertension', status: 'Active', daysAgo: 140, notes: 'Stage 2 HTN. Under ACE inhibitors regimen.' },
  { name: 'Nasima Begum', age: 62, gender: 'Female', phone: '+880 1812-111002', condition: 'Coronary Artery Disease', status: 'Active', daysAgo: 125, notes: 'Post-angiography observation.' },
  { name: 'Kabir Hossain', age: 49, gender: 'Male', phone: '+880 1812-111003', condition: 'Arrhythmia', status: 'Under Observation', daysAgo: 110, notes: 'Holter monitoring in progress.' },
  { name: 'Parveen Sultana', age: 54, gender: 'Female', phone: '+880 1812-111004', condition: 'Heart Failure (Compensated)', status: 'Critical', daysAgo: 25, notes: 'Ejection fraction 35%. ICU consultation requested.' },
  { name: 'Abdul Mannan', age: 67, gender: 'Male', phone: '+880 1812-111005', condition: 'Hypertension', status: 'Discharged', daysAgo: 95, notes: 'BP stabilized at 125/80 mmHg.' },
  { name: 'Shirin Akhter', age: 45, gender: 'Female', phone: '+880 1812-111006', condition: 'Angina Pectoris', status: 'Active', daysAgo: 45, notes: 'Exercised-induced chest tightness.' },
  { name: 'Shahidul Alam', age: 51, gender: 'Male', phone: '+880 1812-111007', condition: 'Hyperlipidemia', status: 'Active', daysAgo: 30, notes: 'LDL > 190. Started Atorvastatin 40mg.' },
  { name: 'Farzana Haque', age: 60, gender: 'Female', phone: '+880 1812-111008', condition: 'Hypertension', status: 'Active', daysAgo: 12, notes: 'Routine monthly checkup.' },

  { name: 'Anwar Sadat', age: 42, gender: 'Male', phone: '+880 1813-222001', condition: 'Chronic Migraine', status: 'Active', daysAgo: 115, notes: 'Refractory aura episodes.' },
  { name: 'Tasnim Ferdous', age: 29, gender: 'Female', phone: '+880 1813-222002', condition: 'Epilepsy', status: 'Under Observation', daysAgo: 90, notes: 'EEG shows temporal lobe sharp waves.' },
  { name: 'Motiur Rahman', age: 68, gender: 'Male', phone: '+880 1813-222003', condition: 'Parkinsons Disease', status: 'Active', daysAgo: 85, notes: 'Resting tremor and bradykinesia noted.' },
  { name: 'Bilkis Banu', age: 71, gender: 'Female', phone: '+880 1813-222004', condition: 'Ischemic Stroke', status: 'Critical', daysAgo: 8, notes: 'Right hemiparesis. Under stroke team protocol.' },
  { name: 'Ziaur Karim', age: 36, gender: 'Male', phone: '+880 1813-222005', condition: 'Cluster Headache', status: 'Discharged', daysAgo: 60, notes: 'Episodic cycle resolved with oxygen therapy.' },
  { name: 'Monira Yesmin', age: 53, gender: 'Female', phone: '+880 1813-222006', condition: 'Neuropathy', status: 'Active', daysAgo: 22, notes: 'Diabetic peripheral neuropathy.' },
  { name: 'Khondoker Babul', age: 64, gender: 'Male', phone: '+880 1813-222007', condition: 'Radiculopathy', status: 'Active', daysAgo: 14, notes: 'L4-L5 nerve root compression.' },

  { name: 'Aarav Hasan', age: 5, gender: 'Male', phone: '+880 1814-333001', condition: 'Pediatric Asthma', status: 'Active', daysAgo: 80, notes: 'Inhaled corticosteroid prescribed.' },
  { name: 'Mehek Chowdhury', age: 3, gender: 'Female', phone: '+880 1814-333002', condition: 'Febrile Seizure', status: 'Under Observation', daysAgo: 65, notes: 'Post-viral febrile event. No focal deficits.' },
  { name: 'Afnan Siddique', age: 8, gender: 'Male', phone: '+880 1814-333003', condition: 'Bronchitis', status: 'Discharged', daysAgo: 50, notes: 'Completed course of Azithromycin.' },
  { name: 'Zara Mahnoor', age: 2, gender: 'Female', phone: '+880 1814-333004', condition: 'Severe Acute Malnutrition', status: 'Active', daysAgo: 35, notes: 'Enrolled in dietary replenishment program.' },
  { name: 'Samiul Haque', age: 11, gender: 'Male', phone: '+880 1814-333005', condition: 'Type 1 Diabetes', status: 'Active', daysAgo: 18, notes: 'Insulin pen basal-bolus education provided.' },
  { name: 'Inaya Fatema', age: 6, gender: 'Female', phone: '+880 1814-333006', condition: 'Allergic Rhinitis', status: 'Active', daysAgo: 9, notes: 'Prescribed Cetirizine syrup.' },
  { name: 'Rayyan Mirza', age: 4, gender: 'Male', phone: '+880 1814-333007', condition: 'Gastroenteritis', status: 'Discharged', daysAgo: 5, notes: 'Rehydrated via ORS. Stool cultures clear.' },

  { name: 'Rezaul Karim', age: 46, gender: 'Male', phone: '+880 1815-444001', condition: 'Femur Fracture', status: 'Under Observation', daysAgo: 70, notes: 'Post-ORIF intramedullary nailing recovery.' },
  { name: 'Rokeya Begum', age: 63, gender: 'Female', phone: '+880 1815-444002', condition: 'Osteoarthritis', status: 'Active', daysAgo: 60, notes: 'Bilateral knee pain. Hyaluronic acid injections.' },
  { name: 'Ashikur Rahman', age: 28, gender: 'Male', phone: '+880 1815-444003', condition: 'ACL Tear', status: 'Active', daysAgo: 45, notes: 'Sports injury. Scheduled for arthroscopic repair.' },
  { name: 'Jannatul Nayeem', age: 34, gender: 'Female', phone: '+880 1815-444004', condition: 'Lumbar Disc Herniation', status: 'Active', daysAgo: 30, notes: 'Physical therapy and core stabilization.' },
  { name: 'Mustafa Kamal', age: 55, gender: 'Male', phone: '+880 1815-444005', condition: 'Frozen Shoulder', status: 'Discharged', daysAgo: 20, notes: 'Range of motion 90% restored.' },
  { name: 'Hasina Momtaz', age: 59, gender: 'Female', phone: '+880 1815-444006', condition: 'Cervical Spondylosis', status: 'Active', daysAgo: 11, notes: 'Cervical collar and isometric neck exercise.' },

  { name: 'Jalal Uddin', age: 65, gender: 'Male', phone: '+880 1816-555001', condition: 'Colorectal Carcinoma', status: 'Active', daysAgo: 48, notes: 'Cycle 3 FOLFOX chemotherapy.' },
  { name: 'Nazma Parveen', age: 52, gender: 'Female', phone: '+880 1816-555002', condition: 'Breast Neoplasm', status: 'Under Observation', daysAgo: 42, notes: 'Post-lumpectomy adjuvant radiotherapy.' },
  { name: 'Sirajul Islam', age: 70, gender: 'Male', phone: '+880 1816-555003', condition: 'Lung Adenocarcinoma', status: 'Critical', daysAgo: 28, notes: 'Stage IV. Target therapy Osimertinib.' },
  { name: 'Ferdousi Begum', age: 48, gender: 'Female', phone: '+880 1816-555004', condition: 'Ovarian Carcinoma', status: 'Active', daysAgo: 16, notes: 'Carboplatin + Paclitaxel protocol.' },
  { name: 'Humayun Kabir', age: 57, gender: 'Male', phone: '+880 1816-555005', condition: 'Multiple Myeloma', status: 'Active', daysAgo: 7, notes: 'Lenalidomide-Dexamethasone maintenance.' },
  { name: 'Suraiya Banu', age: 61, gender: 'Female', phone: '+880 1816-555006', condition: 'Thyroid Carcinoma', status: 'Discharged', daysAgo: 10, notes: 'Post-radioiodine scan shows remission.' },

  { name: 'Shahnewaz Chowdhury', age: 31, gender: 'Male', phone: '+880 1817-666001', condition: 'Plaque Psoriasis', status: 'Active', daysAgo: 29, notes: 'PASI score 14. Topical calcipotriol.' },
  { name: 'Rubina Yasmin', age: 26, gender: 'Female', phone: '+880 1817-666002', condition: 'Atopic Dermatitis', status: 'Active', daysAgo: 24, notes: 'Barrier repair cream & antihistamines.' },
  { name: 'Mahfuz Anam', age: 22, gender: 'Male', phone: '+880 1817-666003', condition: 'Severe Acne Vulgaris', status: 'Active', daysAgo: 19, notes: 'Oral Isotretinoin 20mg daily with LFT monitoring.' },
  { name: 'Laila Arjumand', age: 44, gender: 'Female', phone: '+880 1817-666004', condition: 'Melasma', status: 'Discharged', daysAgo: 15, notes: 'Triple combination cream regimen concluded.' },
  { name: 'Tanvir Hossain', age: 38, gender: 'Male', phone: '+880 1817-666005', condition: 'Alopecia Areata', status: 'Active', daysAgo: 6, notes: 'Intralesional triamcinolone acetonide injections.' },
  { name: 'Sultana Razia', age: 50, gender: 'Female', phone: '+880 1817-666006', condition: 'Vitiligo', status: 'Under Observation', daysAgo: 2, notes: 'Phototherapy NB-UVB twice weekly.' },
];

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    console.log('[Seed] Creating default administrative account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@doctortracker.com',
      password: 'Admin@123456',
      role: 'admin',
    });
    console.log(`[Seed] Admin created: ${adminUser.email} (Password: Admin@123456)`);

    console.log('[Seed] Seeding 12 medical doctors...');
    const insertedDoctors = await Doctor.insertMany(sampleDoctors);
    console.log(`[Seed] Inserted ${insertedDoctors.length} doctors across 6 clinical specialties.`);

    console.log('[Seed] Seeding patients and associating with doctors...');
    const patientDocs = [];

    const doctorsBySpecialty = new Map<string, typeof insertedDoctors>();
    for (const doc of insertedDoctors) {
      const list = doctorsBySpecialty.get(doc.specialization) || [];
      list.push(doc);
      doctorsBySpecialty.set(doc.specialization, list);
    }

    const specialtyConditionMap: Record<string, string> = {
      Hypertension: 'Cardiology',
      'Coronary Artery Disease': 'Cardiology',
      Arrhythmia: 'Cardiology',
      'Heart Failure (Compensated)': 'Cardiology',
      'Angina Pectoris': 'Cardiology',
      Hyperlipidemia: 'Cardiology',
      'Chronic Migraine': 'Neurology',
      Epilepsy: 'Neurology',
      'Parkinsons Disease': 'Neurology',
      'Ischemic Stroke': 'Neurology',
      'Cluster Headache': 'Neurology',
      Neuropathy: 'Neurology',
      Radiculopathy: 'Neurology',
      'Pediatric Asthma': 'Pediatrics',
      'Febrile Seizure': 'Pediatrics',
      Bronchitis: 'Pediatrics',
      'Severe Acute Malnutrition': 'Pediatrics',
      'Type 1 Diabetes': 'Pediatrics',
      'Allergic Rhinitis': 'Pediatrics',
      Gastroenteritis: 'Pediatrics',
      'Femur Fracture': 'Orthopedics',
      Osteoarthritis: 'Orthopedics',
      'ACL Tear': 'Orthopedics',
      'Lumbar Disc Herniation': 'Orthopedics',
      'Frozen Shoulder': 'Orthopedics',
      'Cervical Spondylosis': 'Orthopedics',
      'Colorectal Carcinoma': 'Oncology',
      'Breast Neoplasm': 'Oncology',
      'Lung Adenocarcinoma': 'Oncology',
      'Ovarian Carcinoma': 'Oncology',
      'Multiple Myeloma': 'Oncology',
      'Thyroid Carcinoma': 'Oncology',
      'Plaque Psoriasis': 'Dermatology',
      'Atopic Dermatitis': 'Dermatology',
      'Severe Acne Vulgaris': 'Dermatology',
      Melasma: 'Dermatology',
      'Alopecia Areata': 'Dermatology',
      Vitiligo: 'Dermatology',
    };

    let roundRobinIdx = 0;
    for (const raw of rawPatients) {
      const targetSpecialty = specialtyConditionMap[raw.condition] || 'Cardiology';
      const availableDocs = doctorsBySpecialty.get(targetSpecialty) || insertedDoctors;
      const assignedDoctor = availableDocs[roundRobinIdx % availableDocs.length];
      roundRobinIdx++;

      const admissionDate = new Date(Date.now() - raw.daysAgo * 24 * 60 * 60 * 1000);

      patientDocs.push({
        name: raw.name,
        age: raw.age,
        gender: raw.gender,
        phone: raw.phone,
        email: `${raw.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        condition: raw.condition,
        status: raw.status,
        admissionDate,
        doctor: assignedDoctor._id,
        notes: raw.notes,
        createdAt: admissionDate,
        updatedAt: admissionDate,
      });
    }

    const insertedPatients = await Patient.insertMany(patientDocs);
    console.log(`[Seed] Inserted ${insertedPatients.length} patient records.`);

    console.log('[Seed] Recalculating doctor patientCounts...');
    for (const doc of insertedDoctors) {
      const count = await Patient.countDocuments({ doctor: doc._id });
      await Doctor.findByIdAndUpdate(doc._id, { patientCount: count });
    }

    console.log('----------------------------------------------------');
    console.log('[Seed] Database seeding completed successfully!');
    console.log('[Seed] Default Admin Credentials:');
    console.log('       Email:    admin@doctortracker.com');
    console.log('       Password: Admin@123456');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
