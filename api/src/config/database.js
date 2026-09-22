// api

// npm install express mongoose cors dotenv
// npm install -D typescript @types/express @types/cors @types/node ts-node-dev
//  npm install bcryptjs jsonwebtoken

// ui

// npm install
// npm install react-router-dom axios
// npm install -D tailwindcss postcss autoprefixer
// npm install lucide-react
// npm install -D sass


import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1); 
  }
};
