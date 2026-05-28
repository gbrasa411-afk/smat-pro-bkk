import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from 'bcryptjs';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import type { ChecklistTemplateItem } from './schema/checklists';
import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// ─── Checklist Templates ─────────────────────────────────────────────────────
const CHECKLISTS: Record<string, ChecklistTemplateItem[]> = {
  'Mesin Fogging': [
    { label: 'Ketersediaan bahan bakar (bensin) mencukupi', category: 'Bahan Bakar & Kimia' },
    { label: 'Ketersediaan cairan kimia fogging mencukupi', category: 'Bahan Bakar & Kimia' },
    { label: 'Tangki bahan bakar dan cairan kimia tidak bocor', category: 'Bahan Bakar & Kimia' },
    { label: 'Kondisi koil pemanas dan pompa berfungsi baik', category: 'Komponen Utama' },
    { label: 'Nozzle semprot bersih dan tidak tersumbat', category: 'Selang & Nozzle' },
    { label: 'Starter dan sistem penyalaan berfungsi normal', category: 'Operasional' },
    { label: 'Pelindung panas terpasang kokoh', category: 'Keselamatan' },
  ],
  'Mikroskop Binokuler': [
    { label: 'Kondisi fisik body kokoh dan bersih dari debu', category: 'Fisik' },
    { label: 'Lensa okuler dan objektif bersih (tidak berjamur)', category: 'Optik' },
    { label: 'Revolver lensa objektif berputar dengan lancar', category: 'Mekanik' },
    { label: 'Fokus kasar (coarse) dan fokus halus (fine) berfungsi normal', category: 'Mekanik' },
    { label: 'Lampu LED illuminator menyala stabil', category: 'Kelistrikan' },
    { label: 'Kabel power dalam kondisi aman (tidak lecet)', category: 'Kelistrikan' },
    { label: 'Meja preparat (stage) bergerak lancar di sumbu X dan Y', category: 'Mekanik' },
  ],
  'Centrifuge': [
    { label: 'Kondisi fisik penutup luar dan engsel pengunci kokoh', category: 'Fisik' },
    { label: 'Rotor bersih dari sisa cairan atau korosi', category: 'Rotor' },
    { label: 'Tube holder terpasang lengkap dan seimbang', category: 'Rotor' },
    { label: 'Timer dan pengatur kecepatan berfungsi normal', category: 'Sistem Kontrol' },
    { label: 'Sistem pengunci otomatis (lid lock) berfungsi saat berjalan', category: 'Keselamatan' },
    { label: 'Putaran rotor stabil tanpa getaran/suara bising abnormal', category: 'Operasional' },
    { label: 'Kabel power dan steker dalam kondisi aman', category: 'Kelistrikan' },
  ],
  'Autoclave': [
    { label: 'Kondisi fisik pintu, segel gasket, dan pengunci aman', category: 'Fisik' },
    { label: 'Level air (aquades) di dalam chamber mencukupi', category: 'Cairan & Tekanan' },
    { label: 'Pressure gauge (pengukur tekanan) bekerja normal', category: 'Cairan & Tekanan' },
    { label: 'Safety valve (katup pengaman) bebas sumbatan', category: 'Keselamatan' },
    { label: 'Pemanas listrik (heating element) berfungsi baik', category: 'Kelistrikan' },
    { label: 'Tampilan suhu dan timer pada display digital normal', category: 'Sistem Kontrol' },
    { label: 'Siklus sterilisasi selesai dengan sempurna', category: 'Operasional' },
  ],
  'Incubator': [
    { label: 'Kondisi fisik pintu kaca bagian dalam menutup rapat', category: 'Fisik' },
    { label: 'Karet peredam pintu luar (gasket) tidak robek/longgar', category: 'Fisik' },
    { label: 'Pemanas (heating element) dan kipas sirkulasi berfungsi', category: 'Operasional' },
    { label: 'Suhu di dalam chamber stabil sesuai setting', category: 'Performa' },
    { label: 'Tampilan suhu pada control panel digital normal', category: 'Sistem Kontrol' },
    { label: 'Rak penyangga bersih dari karat atau kontaminasi', category: 'Kebersihan' },
    { label: 'Koneksi listrik dan grounding aman', category: 'Kelistrikan' },
  ],
  'Defibrillator (AED)': [
    { label: 'Kondisi fisik unit bersih, tidak retak atau rusak', category: 'Fisik' },
    { label: 'Indikator status baterai menunjukkan "Ready" (hijau/centang)', category: 'Power' },
    { label: 'Pad elektroda (dewasa/anak) belum kadaluarsa & tersegel', category: 'Aksesoris' },
    { label: 'Konektor pad terhubung dengan baik ke unit', category: 'Aksesoris' },
    { label: 'Self-test harian/mingguan otomatis lulus (OK)', category: 'Sistem' },
    { label: 'Tombol pengoperasian (On/Off, Shock) responsif', category: 'Fungsional' },
    { label: 'Kotak penyimpanan (alarm cabinet) berfungsi', category: 'Penyimpanan' },
  ],
  'Patient Monitor': [
    { label: 'Kondisi fisik casing dan layar LCD tidak retak/rusak', category: 'Fisik' },
    { label: 'Kabel sensor SpO2, NIBP, dan ECG terpasang rapi', category: 'Aksesoris' },
    { label: 'Cuff tensi (NIBP) bersih, tidak bocor, velkro melekat erat', category: 'Aksesoris' },
    { label: 'Alarm batas atas/bawah parameter berfungsi nyaring', category: 'Sistem Alarm' },
    { label: 'Baterai cadangan internal terisi & mampu mem-backup daya', category: 'Power' },
    { label: 'Semua parameter (ECG, SpO2, NIBP, Respi, Temp) terbaca akurat', category: 'Performa' },
    { label: 'Kabel grounding terpasang untuk menghindari induksi listrik', category: 'Kelistrikan' },
  ],
  'Tensimeter Digital': [
    { label: 'Kondisi casing luar bersih dan tidak ada keretakan', category: 'Fisik' },
    { label: 'Layar display LCD menyala jelas (tidak ada segmen angka hilang)', category: 'Fisik' },
    { label: 'Cuff/manset lengan bersih, tidak sobek, dan selang tidak bocor', category: 'Aksesoris' },
    { label: 'Konektor selang masuk ke unit dengan rapat', category: 'Aksesoris' },
    { label: 'Baterai/adaptor listrik menyuplai daya dengan stabil', category: 'Power' },
    { label: 'Pompa udara otomatis memompa manset dengan lancar', category: 'Operasional' },
    { label: 'Hasil pembacaan tekanan (sistolik/diastolik) dan nadi normal', category: 'Performa' },
  ],
  'Thermal Scanner': [
    { label: 'Kondisi lensa thermal dan kamera optik bersih', category: 'Optik' },
    { label: 'Tripod penyangga kokoh dan terkunci rapat', category: 'Fisik' },
    { label: 'Kabel HDMI/LAN/power terhubung dengan rapi & aman', category: 'Koneksi' },
    { label: 'Kalibrator suhu (Blackbody) menyala stabil sesuai suhu acuan', category: 'Kalibrasi' },
    { label: 'Aplikasi pemantau di PC menampilkan citra suhu real-time', category: 'Software' },
    { label: 'Deteksi alarm suhu tinggi (>37.5°C) berbunyi & menangkap gambar', category: 'Fungsional' },
    { label: 'Daya listrik didukung UPS cadangan', category: 'Power' },
  ],
  'Mobil': [
    { label: 'Kondisi body, cat, dan kaca kendaraan bersih & utuh', category: 'Eksterior' },
    { label: 'Kondisi spion kanan-kiri dan wiper berfungsi normal', category: 'Eksterior' },
    { label: 'Lampu utama (jauh/dekat), sein, rem, mundur, dan hazard menyala', category: 'Kelistrikan' },
    { label: 'Klakson berfungsi nyaring', category: 'Kelistrikan' },
    { label: 'Level oli mesin, minyak rem, dan air radiator normal', category: 'Mesin' },
    { label: 'Tekanan dan kondisi ban (4 roda + serep) dalam keadaan baik', category: 'Ban & Rem' },
    { label: 'Rem kaki dan rem tangan berfungsi pakem', category: 'Ban & Rem' },
    { label: 'AC mendinginkan kabin secara normal', category: 'Interior' },
    { label: 'Kelengkapan P3K, APAR mini, dongkrak, dan kunci roda lengkap', category: 'Keamanan' },
    { label: 'STNK dan pajak kendaraan masih berlaku', category: 'Dokumen' },
  ],
  'Sepeda Motor': [
    { label: 'Kondisi fisik body, jok, dan kaca spion utuh & bersih', category: 'Eksterior' },
    { label: 'Lampu utama, sein kanan-kiri, dan lampu rem menyala', category: 'Kelistrikan' },
    { label: 'Klakson dan starter elektrik berfungsi normal', category: 'Kelistrikan' },
    { label: 'Level oli mesin normal & tidak ada rembesan oli di mesin', category: 'Mesin' },
    { label: 'Kondisi tapak ban depan/belakang dan ketegangan rantai baik', category: 'Roda & Suspensi' },
    { label: 'Rem depan dan belakang berfungsi pakem', category: 'Ban & Rem' },
    { label: 'STNK dan pajak kendaraan masih berlaku', category: 'Dokumen' },
  ],
};

async function seed() {
  console.log('🌱 Starting SMAT PRO BKK Tembilahan database seed...\n');

  try {
    // Truncate tables to get a clean slate (CASCADE will clean dependent relations)
    console.log('🧹 Truncating existing tables...');
    await db.execute(sql`TRUNCATE TABLE inspections, vehicle_services, assets, checklist_templates, asset_types, categories, notifications, users CASCADE;`);
    console.log('   ✅ Tables truncated.');

    // 1. Seed Users (with fixed UUIDs to avoid session breaks)
    console.log('👤 Creating users...');
    const hashedPasswords = await Promise.all([
      hash('Super@dmin123', 12),
      hash('Admin@123', 12),
      hash('Petugas@123', 12),
    ]);

    const usersData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'super_admin',
        password: hashedPasswords[0],
        fullName: 'Super Administrator',
        role: 'SUPER_ADMIN' as const,
        email: 'superadmin@smatpro.id',
        isActive: true,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        username: 'admin',
        password: hashedPasswords[1],
        fullName: 'Administrator Kantor',
        role: 'ADMIN' as const,
        email: 'admin@smatpro.id',
        isActive: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        username: 'petugas',
        password: hashedPasswords[2],
        fullName: 'Petugas Inspeksi Lapangan',
        role: 'INSPECTOR' as const,
        email: 'petugas@smatpro.id',
        isActive: true,
      },
    ];

    const insertedUsers = await db.insert(schema.users).values(usersData).returning();
    console.log(`   ✅ Created ${insertedUsers.length} users`);

    // 2. Seed Categories (Peralatan Laboratorium, Peralatan Medis, Kendaraan)
    console.log('📁 Creating categories...');
    const categoriesData: schema.NewCategory[] = [
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Peralatan Laboratorium',
        icon: 'FlaskConical',
        description: 'Peralatan laboratorium untuk pengujian sampel dan karantina kesehatan',
        sortOrder: 1,
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Peralatan Medis',
        icon: 'HeartPulse',
        description: 'Peralatan medis penunjang pemeriksaan kesehatan dan tindakan darurat',
        sortOrder: 2,
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Kendaraan',
        icon: 'Car',
        description: 'Kendaraan dinas operasional dan penunjang mobilitas kantor',
        sortOrder: 3,
      },
    ];

    const insertedCategories = await db.insert(schema.categories).values(categoriesData).returning();
    console.log(`   ✅ Created ${insertedCategories.length} categories`);

    // 3. Seed Asset Types
    console.log('🏷️  Creating asset types...');
    const assetTypesData: (schema.NewAssetType & { id: string })[] = [
      // Peralatan Laboratorium
      { id: '10000000-0000-0000-0000-000000000001', categoryId: '55555555-5555-5555-5555-555555555555', name: 'Mesin Fogging', icon: 'Wind' },
      { id: '10000000-0000-0000-0000-000000000002', categoryId: '55555555-5555-5555-5555-555555555555', name: 'Mikroskop Binokuler', icon: 'FlaskConical' },
      { id: '10000000-0000-0000-0000-000000000003', categoryId: '55555555-5555-5555-5555-555555555555', name: 'Centrifuge', icon: 'Disc' },
      { id: '10000000-0000-0000-0000-000000000004', categoryId: '55555555-5555-5555-5555-555555555555', name: 'Autoclave', icon: 'ShieldAlert' },
      { id: '10000000-0000-0000-0000-000000000005', categoryId: '55555555-5555-5555-5555-555555555555', name: 'Incubator', icon: 'Box' },

      // Peralatan Medis
      { id: '20000000-0000-0000-0000-000000000001', categoryId: '66666666-6666-6666-6666-666666666666', name: 'Defibrillator (AED)', icon: 'Activity' },
      { id: '20000000-0000-0000-0000-000000000002', categoryId: '66666666-6666-6666-6666-666666666666', name: 'Patient Monitor', icon: 'Tv' },
      { id: '20000000-0000-0000-0000-000000000003', categoryId: '66666666-6666-6666-6666-666666666666', name: 'Tensimeter Digital', icon: 'Heart' },
      { id: '20000000-0000-0000-0000-000000000004', categoryId: '66666666-6666-6666-6666-666666666666', name: 'Thermal Scanner', icon: 'Scan' },
      { id: '20000000-0000-0000-0000-000000000005', categoryId: '66666666-6666-6666-6666-666666666666', name: 'Pulse Oximeter', icon: 'Activity' },

      // Kendaraan
      { id: '30000000-0000-0000-0000-000000000001', categoryId: '77777777-7777-7777-7777-777777777777', name: 'Mobil', icon: 'Car' },
      { id: '30000000-0000-0000-0000-000000000002', categoryId: '77777777-7777-7777-7777-777777777777', name: 'Sepeda Motor', icon: 'Bike' },
    ];

    const insertedAssetTypes = await db.insert(schema.assetTypes).values(assetTypesData).returning();
    console.log(`   ✅ Created ${insertedAssetTypes.length} asset types`);

    // 4. Seed Assets (with realistic dates to test warning system: normal, yellow >30 days, red >90 days)
    console.log('📦 Creating assets...');
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const oneHundredDaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);

    const assetsData: schema.NewAsset[] = [
      // Peralatan Laboratorium
      {
        id: 'LAB-FOG-001',
        name: 'Mesin Fogging Portable Tasco KB100',
        categoryId: '55555555-5555-5555-5555-555555555555',
        assetTypeId: '10000000-0000-0000-0000-000000000001',
        location: 'Gudang Sanitasi',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'LAB-FOG-001',
      },
      {
        id: 'LAB-MIC-001',
        name: 'Mikroskop Binokuler Olympus CX23',
        categoryId: '55555555-5555-5555-5555-555555555555',
        assetTypeId: '10000000-0000-0000-0000-000000000002',
        location: 'Ruang Lab Utama',
        lastStatus: 'Normal',
        lastInspectedAt: fortyDaysAgo, // > 30 days -> Yellow highlight
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fortyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'LAB-MIC-001',
      },
      {
        id: 'LAB-CEN-001',
        name: 'Centrifuge 12 Tube Dlab DM0412',
        categoryId: '55555555-5555-5555-5555-555555555555',
        assetTypeId: '10000000-0000-0000-0000-000000000003',
        location: 'Ruang Lab Utama',
        lastStatus: 'Normal',
        lastInspectedAt: oneHundredDaysAgo, // > 90 days -> Red highlight
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(oneHundredDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'LAB-CEN-001',
      },
      {
        id: 'LAB-ACV-001',
        name: 'Autoclave Listrik All American 75X',
        categoryId: '55555555-5555-5555-5555-555555555555',
        assetTypeId: '10000000-0000-0000-0000-000000000004',
        location: 'Ruang Lab Utama',
        lastStatus: 'Belum Diinspeksi', // No inspection yet -> Red highlight
        qrCode: 'LAB-ACV-001',
      },

      // Peralatan Medis
      {
        id: 'MED-AED-001',
        name: 'Defibrillator AED Philips HeartStart FRx',
        categoryId: '66666666-6666-6666-6666-666666666666',
        assetTypeId: '20000000-0000-0000-0000-000000000001',
        location: 'Pos Pemeriksaan Pelabuhan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MED-AED-001',
      },
      {
        id: 'MED-MON-001',
        name: 'Patient Monitor Mindray uMEC10',
        categoryId: '66666666-6666-6666-6666-666666666666',
        assetTypeId: '20000000-0000-0000-0000-000000000002',
        location: 'Klinik / Ruang Karantina',
        lastStatus: 'Perlu Perbaikan',
        lastInspectedAt: fortyDaysAgo, // > 30 days -> Yellow highlight
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fortyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MED-MON-001',
      },
      {
        id: 'MED-TEN-001',
        name: 'Tensimeter Digital Omron HEM-7156',
        categoryId: '66666666-6666-6666-6666-666666666666',
        assetTypeId: '20000000-0000-0000-0000-000000000003',
        location: 'Pos Pemeriksaan Pelabuhan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MED-TEN-001',
      },
      {
        id: 'MED-TSC-001',
        name: 'Thermal Scanner Fever Block Dahua',
        categoryId: '66666666-6666-6666-6666-666666666666',
        assetTypeId: '20000000-0000-0000-0000-000000000004',
        location: 'Lobby Kedatangan Pelabuhan Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: oneHundredDaysAgo, // > 90 days -> Red highlight
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(oneHundredDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MED-TSC-001',
      },
      {
        id: 'MED-OXI-001',
        name: 'Pulse Oximeter ChoiceMMed MD300C2',
        categoryId: '66666666-6666-6666-6666-666666666666',
        assetTypeId: '20000000-0000-0000-0000-000000000005',
        location: 'Pos Pemeriksaan Pelabuhan',
        lastStatus: 'Belum Diinspeksi', // No inspection yet -> Red highlight
        qrCode: 'MED-OXI-001',
      },

      // Kendaraan
      {
        id: 'MOB-INV-001',
        name: 'Mobil Toyota Innova',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-INV-001',
      },
      {
        id: 'MOB-HAC-001',
        name: 'Mobil Toyota Hi Ace',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-HAC-001',
      },
      {
        id: 'MOB-GMA-001',
        name: 'Mobil Daihatsu Gran Max Ambulance',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Sungai Guntung',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-GMA-001',
      },
      {
        id: 'MOB-APV-001',
        name: 'Mobil Suzuki APV Luxury Ambulance',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-APV-001',
      },
      {
        id: 'MOB-HLX-001',
        name: 'Mobil Toyota Hilux Double Cabin',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Kuala Gaung',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-HLX-001',
      },
      {
        id: 'MOB-TRT-001',
        name: 'Mobil Mitsubishi Strada Triton Double Cabin',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000001',
        location: 'Kuala Enok',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOB-TRT-001',
      },
      {
        id: 'MOT-SPX-001',
        name: 'Motor Honda Supra X 125 FI 2018',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000002',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOT-SPX-001',
      },
      {
        id: 'MOT-SPX-002',
        name: 'Motor Honda Supra X 125 Helm In',
        categoryId: '77777777-7777-7777-7777-777777777777',
        assetTypeId: '30000000-0000-0000-0000-000000000002',
        location: 'Pulau Kijang',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'MOT-SPX-002',
      },
    ];

    const insertedAssets = await db.insert(schema.assets).values(assetsData).returning();
    console.log(`   ✅ Created ${insertedAssets.length} assets`);

    // 5. Seed Checklist Templates
    console.log('📋 Creating checklist templates...');
    const checklistValues: schema.NewChecklistTemplate[] = [];

    for (const [typeName, items] of Object.entries(CHECKLISTS)) {
      const type = insertedAssetTypes.find((at) => at.name === typeName);
      if (type) {
        checklistValues.push({
          assetTypeId: type.id,
          items,
        });
      } else {
        console.warn(`   ⚠️  Asset type "${typeName}" not found, skipping checklist`);
      }
    }

    const insertedChecklists = await db.insert(schema.checklistTemplates).values(checklistValues).returning();
    console.log(`   ✅ Created ${insertedChecklists.length} checklist templates`);

    // 6. Seed mock inspections (to populate stats and history properly)
    console.log('📝 Creating mock inspections...');
    const schemaResultsMock = [
      { label: 'Kondisi fisik unit bersih, tidak retak atau rusak', category: 'Fisik', result: 'pass' as const },
      { label: 'Indikator status baterai menunjukkan "Ready"', category: 'Power', result: 'pass' as const },
    ];

    const mockInspections = [
      {
        assetId: 'LAB-FOG-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Normal' as const,
        checklistResults: schemaResultsMock,
        notes: 'Semua komponen aman dan berfungsi baik.',
        createdAt: fiveDaysAgo,
      },
      {
        assetId: 'MED-AED-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Normal' as const,
        checklistResults: schemaResultsMock,
        notes: 'Unit AED siap digunakan.',
        createdAt: fiveDaysAgo,
      },
      {
        assetId: 'LAB-MIC-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Normal' as const,
        checklistResults: schemaResultsMock,
        notes: 'Perlu dijadwalkan pembersihan lensa rutin.',
        createdAt: fortyDaysAgo,
      },
      {
        assetId: 'MED-MON-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Perlu Perbaikan' as const,
        checklistResults: [
          { label: 'Cuff tensi (NIBP) bersih, tidak bocor, velkro melekat erat', category: 'Aksesoris', result: 'fail' as const, notes: 'Velkro manset sudah aus' },
        ],
        notes: 'Manset tensi (NIBP cuff) perlu diganti karena velkro tidak merekat kuat.',
        createdAt: fortyDaysAgo,
      },
      {
        assetId: 'LAB-CEN-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Normal' as const,
        checklistResults: schemaResultsMock,
        notes: 'Rotor stabil.',
        createdAt: oneHundredDaysAgo,
      },
      {
        assetId: 'MED-TSC-001',
        inspectorId: '33333333-3333-3333-3333-333333333333',
        inspectorName: 'Petugas Inspeksi Lapangan',
        status: 'Normal' as const,
        checklistResults: schemaResultsMock,
        notes: 'Kalibrasi blackbody normal.',
        createdAt: oneHundredDaysAgo,
      },
    ];

    await db.insert(schema.inspections).values(mockInspections);
    console.log(`   ✅ Created ${mockInspections.length} mock inspections`);

    // 7. Seed mock notifications
    console.log('🔔 Creating mock notifications...');
    const mockNotifications = [
      {
        userId: '22222222-2222-2222-2222-222222222222', // Admin
        title: 'Inspeksi Terlambat',
        message: 'Aset Centrifuge (LAB-CEN-001) belum diinspeksi lebih dari 90 hari.',
        type: 'DANGER' as const,
        isRead: false,
        link: '/inventory/LAB-CEN-001',
        createdAt: now,
      },
      {
        userId: '22222222-2222-2222-2222-222222222222', // Admin
        title: 'Inspeksi Segera',
        message: 'Aset Mikroskop (LAB-MIC-001) mendekati batas 30 hari tanpa inspeksi.',
        type: 'WARNING' as const,
        isRead: false,
        link: '/inventory/LAB-MIC-001',
        createdAt: now,
      },
      {
        userId: '22222222-2222-2222-2222-222222222222', // Admin
        title: 'Peralatan Butuh Perbaikan',
        message: 'Hasil inspeksi Patient Monitor (MED-MON-001) berstatus "Perlu Perbaikan".',
        type: 'INFO' as const,
        isRead: true,
        link: '/inventory/MED-MON-001',
        createdAt: fiveDaysAgo,
      },
    ];
    await db.insert(schema.notifications).values(mockNotifications);
    console.log(`   ✅ Created ${mockNotifications.length} mock notifications`);

    console.log('\n════════════════════════════════════════════════');
    console.log('🎉 SMAT PRO BKK Tembilahan Database seeded successfully!');
    console.log('════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script run error:', error);
    process.exit(1);
  });
