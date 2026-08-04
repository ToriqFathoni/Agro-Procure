import * as dotenv from 'dotenv';

// 1. Pastikan .env.local dibaca paling pertama
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    console.log('Loading environment variables...');

    // 2. Dynamic Import: Memanggil koneksi dan model SETELAH env terbaca
    const dbModule = await import('../lib/mongodb');
    const connectToDatabase = dbModule.default || dbModule;
    const { Vendor } = await import('../models/Vendor');

    console.log('Connecting to database...');
    // Menjalankan fungsi koneksi
    if (typeof connectToDatabase === 'function') {
      await connectToDatabase();
    } else {
      console.log('Database connection already established globally.');
    }

    console.log('Clearing existing vendor data...');
    await Vendor.deleteMany({});

    console.log('Inserting dummy Vendors...');
    await Vendor.insertMany([
      {
        name: 'Pak Budi Sayur',
        whatsapp_number: 'YOUR_WHATSAPP_TEST_NUMBER_HERE', // Nanti ganti dengan nomor WA Anda
        commodities: ['tomat', 'cabai', 'bawang'],
        fulfillment_score: 0.95,
        status: 'ACTIVE',
        address: 'Jl. Lembang No. 1'
      },
      {
        name: 'KUD Tani Makmur',
        whatsapp_number: '6281111111111',
        commodities: ['beras', 'jagung'],
        fulfillment_score: 0.88,
        status: 'ACTIVE',
        address: 'Jl. Lembang No. 2'
      },
      {
        name: 'Ibu Siti Rempah',
        whatsapp_number: '6282222222222',
        commodities: ['jahe', 'kunyit', 'lengkuas'],
        fulfillment_score: 0.92,
        status: 'ACTIVE',
        address: 'Jl. Lembang No. 3'
      },
      {
        name: 'Juragan Sayur Lembang',
        whatsapp_number: '6283333333333',
        commodities: ['kentang', 'wortel', 'kol'],
        fulfillment_score: 0.85,
        status: 'ACTIVE',
        address: 'Jl. Lembang No. 4'
      },
      {
        name: 'Pemasok Daging Makmur',
        whatsapp_number: '6284444444444',
        commodities: ['daging ayam', 'telur'],
        fulfillment_score: 0.9,
        status: 'ACTIVE',
        address: 'Jl. Lembang No. 5'
      },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();