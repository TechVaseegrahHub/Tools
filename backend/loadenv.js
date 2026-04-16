import dotenv from 'dotenv';
dotenv.config();
console.log('Dotenv loaded from loadenv.js');
console.log('MONGO_URI present:', !!process.env.MONGO_URI);
