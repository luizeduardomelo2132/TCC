import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js'; 
import TutorRoutes from './routes/TutorRouter.js';
import PetRoutes from './routes/PetRouter.js'; 
import consultaRoutes from './routes/ConsultaRouter.js';
import ProntuarioRoutes from './routes/ProntuarioRoutes.js';
import AuthRoutes from './routes/AuthRouter.js'; 
import UsuarioRoutes from './routes/UsuarioRouter.js';

// inicia variaveis de ambiente
dotenv.config();

// conecta o banco de dados
connectDB();

const app = express();

// config do Express 
app.use(cors());
app.use(express.json());

app.use('/api/tutores', TutorRoutes);
app.use('/api/pets', PetRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/prontuarios', ProntuarioRoutes);
app.use('/api/auth', AuthRoutes); 
app.use('/api/usuarios', UsuarioRoutes);
// rota de teste
app.get('/', (req, res) => {
  res.send('API da Clínica Veterinária está rodando');
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});