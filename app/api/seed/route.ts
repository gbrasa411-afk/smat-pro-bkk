import { NextResponse } from 'next/server';
import { db } from '@/db';
import { hash } from 'bcryptjs';
import { sql } from 'drizzle-orm';
import * as schema from '@/db/schema';

const CHECKLISTS = {
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
  'Komputer': [
    { label: 'Sistem Operasi berlisensi aktif & legal', category: 'Sistem Operasi' },
    { label: 'Sistem Operasi dan patch keamanan terupdate', category: 'Sistem Operasi' },
    { label: 'Kapasitas RAM terdeteksi penuh dan sesuai spesifikasi', category: 'Hardware' },
    { label: 'Kinerja RAM stabil tanpa ada gejala crash/bluescreen', category: 'Hardware' },
    { label: 'Suhu pendingin CPU/Processor normal & kipas tidak bising', category: 'Hardware' },
    { label: 'Kinerja CPU/Processor stabil di bawah beban kerja', category: 'Hardware' },
    { label: 'Kapasitas sisa penyimpanan SSD/HDD mencukupi (>20% bebas)', category: 'Hardware' },
    { label: 'Kondisi kesehatan disk penyimpanan (S.M.A.R.T status) baik', category: 'Hardware' },
    { label: 'Layar monitor menyala normal tanpa dead pixel/distorsi', category: 'Periferal' },
    { label: 'Keyboard dan Mouse berfungsi normal & responsif', category: 'Periferal' },
    { label: 'Power Supply (PSU) stabil & kabel tidak ada yang terkelupas', category: 'Kelistrikan' },
    { label: 'UPS (Backup Daya) berfungsi normal saat listrik padam', category: 'Kelistrikan' },
    { label: 'Kabel LAN terhubung stabil atau Wi-Fi menangkap sinyal baik', category: 'Konektivitas' },
    { label: 'Semua port USB pada casing berfungsi normal', category: 'Konektivitas' },
  ],
  'Laptop': [
    { label: 'Sistem Operasi berlisensi aktif & terupdate', category: 'Sistem Operasi' },
    { label: 'Kondisi fisik layar bersih dan tidak ada dead pixel', category: 'Fisik' },
    { label: 'Keyboard & Touchpad berfungsi normal dan responsif', category: 'Fisik' },
    { label: 'Baterai dapat menahan daya dengan baik (tidak bocor/kembung)', category: 'Baterai' },
    { label: 'Charger/adaptor original berfungsi menyuplai daya dengan stabil', category: 'Baterai' },
    { label: 'Suhu casing laptop normal (kipas sirkulasi bekerja baik)', category: 'Operasional' },
    { label: 'Wi-Fi & Bluetooth menangkap sinyal dengan stabil', category: 'Konektivitas' },
    { label: 'Semua port USB & HDMI berfungsi dengan normal', category: 'Konektivitas' },
  ],
  'Printer': [
    { label: 'Tingkat tinta/toner terisi mencukupi', category: 'Ketersediaan' },
    { label: 'Roller penarik kertas bersih & tidak menyebabkan paper-jam', category: 'Mekanik' },
    { label: 'Kaca scanner bersih dari noda/debu (tipe 3-in-1)', category: 'Fisik' },
    { label: 'Kabel power dan USB/LAN terhubung dengan rapi & kokoh', category: 'Kelistrikan' },
    { label: 'Uji cetak dokumen bersih, tidak bergaris, dan jelas', category: 'Hasil Cetak' },
    { label: 'Uji cetak warna presisi dan tidak pudar', category: 'Hasil Cetak' },
  ],
};

export async function GET(request: Request) {
  // Simple secret protection
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'smatpro123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🌱 Starting SMAT PRO BKK Tembilahan database seed via API...');

    // Truncate tables to get a clean slate (CASCADE will clean dependent relations)
    await db.execute(sql`TRUNCATE TABLE inspections, vehicle_services, assets, checklist_templates, asset_types, categories, notifications, users CASCADE;`);

    // 1. Seed Users
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

    // 2. Seed Categories (Peralatan Laboratorium, Peralatan Medis, Kendaraan)
    const categoriesData = [
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
      {
        id: '88888888-8888-8888-8888-888888888888',
        name: 'Teknologi Informasi & Komunikasi',
        icon: 'Laptop',
        description: 'Peralatan teknologi informasi dan komunikasi kantor',
        sortOrder: 4,
      },
    ];

    const insertedCategories = await db.insert(schema.categories).values(categoriesData).returning();

    // 3. Seed Asset Types
    const assetTypesData = [
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

      // Teknologi Informasi & Komunikasi
      { id: '40000000-0000-0000-0000-000000000001', categoryId: '88888888-8888-8888-8888-888888888888', name: 'Komputer', icon: 'Monitor' },
      { id: '40000000-0000-0000-0000-000000000002', categoryId: '88888888-8888-8888-8888-888888888888', name: 'Laptop', icon: 'Laptop' },
      { id: '40000000-0000-0000-0000-000000000003', categoryId: '88888888-8888-8888-8888-888888888888', name: 'Printer', icon: 'Printer' },
    ];

    const insertedAssetTypes = await db.insert(schema.assetTypes).values(assetTypesData).returning();

    // 4. Seed Assets
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const oneHundredDaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);

    const assetsData = [
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
        lastInspectedAt: fortyDaysAgo,
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
        lastInspectedAt: oneHundredDaysAgo,
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
        lastStatus: 'Belum Diinspeksi',
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
        lastInspectedAt: fortyDaysAgo,
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
        lastInspectedAt: oneHundredDaysAgo,
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
        lastStatus: 'Belum Diinspeksi',
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
      {
        id: 'INF-KOM-001',
        name: 'Komputer PC Dell OptiPlex 7090',
        categoryId: '88888888-8888-8888-8888-888888888888',
        assetTypeId: '40000000-0000-0000-0000-000000000001',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'INF-KOM-001',
      },
      {
        id: 'INF-LAP-001',
        name: 'Laptop Lenovo ThinkPad L13 Gen 2',
        categoryId: '88888888-8888-8888-8888-888888888888',
        assetTypeId: '40000000-0000-0000-0000-000000000002',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'INF-LAP-001',
      },
      {
        id: 'INF-PRI-001',
        name: 'Printer Epson EcoTank L3210',
        categoryId: '88888888-8888-8888-8888-888888888888',
        assetTypeId: '40000000-0000-0000-0000-000000000003',
        location: 'Tembilahan',
        lastStatus: 'Normal',
        lastInspectedAt: fiveDaysAgo,
        lastInspectedBy: '33333333-3333-3333-3333-333333333333',
        nextInspectionDue: new Date(fiveDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        qrCode: 'INF-PRI-001',
      },
    ];

    const insertedAssets = await db.insert(schema.assets).values(assetsData).returning();

    // 5. Seed Checklist Templates
    const checklistValues: any[] = [];
    for (const [typeName, items] of Object.entries(CHECKLISTS)) {
      const type = insertedAssetTypes.find((at) => at.name === typeName);
      if (type) {
        checklistValues.push({
          assetTypeId: type.id,
          items,
        });
      }
    }

    const insertedChecklists = await db.insert(schema.checklistTemplates).values(checklistValues).returning();

    // 6. Seed mock inspections
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

    // 7. Seed mock notifications
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

    return NextResponse.json({
      success: true,
      summary: {
        users: insertedUsers.length,
        categories: insertedCategories.length,
        assetTypes: insertedAssetTypes.length,
        assets: insertedAssets.length,
        checklistTemplates: insertedChecklists.length,
        inspections: mockInspections.length,
        notifications: mockNotifications.length,
      }
    });

  } catch (error: any) {
    console.error('❌ API Seed failed:', error);
    return NextResponse.json({ 
      error: error.message,
      detail: error.detail || null,
      code: error.code || null,
    }, { status: 500 });
  }
}
