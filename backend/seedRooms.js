require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const seedRooms = [
  { roomNumber: '101', type: 'Single', floor: 1, capacity: 1, price: 15000, amenities: ['WiFi', 'Desk'], description: 'Cozy single room' },
  { roomNumber: '102', type: 'Double', floor: 1, capacity: 2, price: 25000, amenities: ['WiFi', 'AC'], description: 'Spacious double room' },
  { roomNumber: '201', type: 'Suite',  floor: 2, capacity: 4, price: 50000, amenities: ['WiFi', 'AC', 'Kitchenette'], description: 'Luxury suite' },
  { roomNumber: '202', type: 'Single', floor: 2, capacity: 1, price: 16000, amenities: ['WiFi', 'Balcony'], description: 'Single with view' },
  { roomNumber: '301', type: 'Double', floor: 3, capacity: 2, price: 24000, amenities: ['WiFi'], description: 'Quiet double room' },
  { roomNumber: '302', type: 'Suite',  floor: 3, capacity: 4, price: 48000, amenities: ['WiFi', 'AC'], description: 'Large suite' },
  { roomNumber: '401', type: 'Single', floor: 4, capacity: 1, price: 17000, amenities: ['WiFi', 'AC'], description: 'Premium single' },
  { roomNumber: '402', type: 'Double', floor: 4, capacity: 2, price: 26000, amenities: ['WiFi', 'Fridge'], description: 'Double with fridge' },
  { roomNumber: '501', type: 'Single', floor: 5, capacity: 1, price: 18000, amenities: ['WiFi', 'TV'], description: 'Single with TV' },
  { roomNumber: '502', type: 'Suite',  floor: 5, capacity: 4, price: 55000, amenities: ['WiFi', 'AC', 'Living Area'], description: 'Penthouse suite' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    for (const rData of seedRooms) {
      // Check if exists first to avoid unique constraint error
      const exists = await Room.findOne({ roomNumber: rData.roomNumber });
      if (!exists) {
        await Room.create(rData);
        console.log(`Added Room ${rData.roomNumber}`);
      } else {
        console.log(`Room ${rData.roomNumber} already exists, skipping.`);
      }
    }
    
    console.log('Done seeding!');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

seed();
