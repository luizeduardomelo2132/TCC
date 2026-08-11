import express from 'express';
import { listarUsuarios } from '../controllers/UsuarioController.js';

const router = express.Router();

router.get('/', listarUsuarios);

export default router;