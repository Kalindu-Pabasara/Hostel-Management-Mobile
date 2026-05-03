require('dotenv').config();
const mongoose = require('mongoose');
const Room     = require('./models/Room');

const rooms = [
  { roomNumber:'A101', type:'Single', floor:1, capacity:1, price:15000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk'], description:'Comfortable single room on Floor 1 with AC.' },
  { roomNumber:'A102', type:'Single', floor:1, capacity:1, price:15000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk'], description:'Bright single room on Floor 1.' },
  { roomNumber:'A103', type:'Single', floor:1, capacity:1, price:15000, status:'available', amenities:['WiFi','Fan','Wardrobe'], description:'Single room with fan on Floor 1.' },
  { roomNumber:'A104', type:'Single', floor:1, capacity:1, price:15000, status:'occupied',  amenities:['WiFi','Fan','Wardrobe'], description:'Single room on Floor 1.' },
  { roomNumber:'A105', type:'Single', floor:1, capacity:1, price:15000, status:'available', amenities:['WiFi','Fan','Wardrobe','Study Desk'], description:'Single room with study desk on Floor 1.' },
  { roomNumber:'A106', type:'Single', floor:1, capacity:1, price:15000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk'], description:'AC single room on Floor 1.' },
  { roomNumber:'B201', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Attached Bathroom'], description:'Spacious double room with attached bathroom.' },
  { roomNumber:'B202', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Attached Bathroom'], description:'Double room with AC on Floor 2.' },
  { roomNumber:'B203', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','Fan','Wardrobe','Attached Bathroom'], description:'Double room with fan on Floor 2.' },
  { roomNumber:'B204', type:'Double', floor:2, capacity:2, price:22000, status:'maintenance', amenities:['WiFi','AC','Wardrobe','Study Desk','Attached Bathroom'], description:'Currently under maintenance.' },
  { roomNumber:'B205', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','AC','Wardrobe','Attached Bathroom'], description:'Double room on Floor 2 with AC.' },
  { roomNumber:'B206', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Attached Bathroom'], description:'Spacious double room on Floor 2.' },
  { roomNumber:'B207', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','Fan','Wardrobe','Attached Bathroom'], description:'Double room with fan on Floor 2.' },
  { roomNumber:'B208', type:'Double', floor:2, capacity:2, price:22000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Attached Bathroom'], description:'AC double room on Floor 2.' },
  { roomNumber:'C301', type:'Suite',  floor:3, capacity:1, price:35000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Private Bathroom','TV','Balcony'], description:'Premium suite with balcony and private bathroom.' },
  { roomNumber:'C302', type:'Suite',  floor:3, capacity:1, price:35000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Private Bathroom','TV'], description:'Luxury suite on Floor 3 with TV.' },
  { roomNumber:'C303', type:'Suite',  floor:3, capacity:1, price:35000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Private Bathroom','TV','Balcony'], description:'Premium suite with balcony view.' },
  { roomNumber:'C304', type:'Suite',  floor:3, capacity:1, price:35000, status:'available', amenities:['WiFi','AC','Wardrobe','Study Desk','Private Bathroom','TV'], description:'Luxury suite on Floor 3.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing rooms to avoid duplicates
    const deleted = await Room.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing rooms`);

    // Insert all rooms
    const inserted = await Room.insertMany(rooms);
    console.log(`✅ Seeded ${inserted.length} rooms successfully!\n`);

    // Print summary
    inserted.forEach(r => console.log(`  ${r.roomNumber} | ${r.type} | LKR ${r.price.toLocaleString()} | ${r.status}`));

    console.log('\n🎉 Done! Open the app and go to Rooms tab.');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
