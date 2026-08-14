import express from 'express';
import * as UsuarioController from '../controllers/UsuarioController.js';
import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

// Apenas Recepção e Veterinários gerenciam o cadastro de tutores
const cargosPermitidos = apenasCargos(['admin']);

router.post('/', verificarToken, cargosPermitidos, UsuarioController.criarTutor);
router.get('/', verificarToken, cargosPermitidos, UsuarioController.listarTutores);
router.get('/:id', verificarToken, cargosPermitidos, UsuarioController.obterTutor);
router.put('/:id', verificarToken, cargosPermitidos, UsuarioController.atualizarTutor);
router.delete('/:id', verificarToken, cargosPermitidos, UsuarioController.deleteTutor);
router.get('/meu-perfil', verificarToken, UsuarioController.obterMeuPerfil);
router.put('/atualizar-perfil', verificarToken, UsuarioController.atualizarMeuPerfil);
router.put('/trocar-senha', verificarToken, UsuarioController.trocarMinhaSenha);

export default router;




