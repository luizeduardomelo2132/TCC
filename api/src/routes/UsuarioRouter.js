import express from 'express';

import * as UsuarioController from '../controllers/UsuarioController.js';

import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

// MEU PERFIL (qualquer usuário autenticado:
// tutor, veterinário ou admin)
// Precisa vir ANTES de qualquer rota '/:id',
// senão o Express trataria "meu-perfil" como id.

router.get('/meu-perfil', verificarToken, UsuarioController.obterMeuPerfil);
router.put('/atualizar-perfil', verificarToken, UsuarioController.atualizarMeuPerfil);
router.put('/trocar-senha', verificarToken, UsuarioController.trocarMinhaSenha);

// VETERINÁRIOS
// Tutor também pode consultar os veterinários
// disponíveis para realizar agendamento.

router.get('/veterinarios', verificarToken, apenasCargos(['admin', 'veterinario', 'tutor']), UsuarioController.listarVeterinarios);

// Adm

router.get('/', verificarToken, apenasCargos(['admin']), UsuarioController.listarUsuarios);
router.delete( '/:id', verificarToken, apenasCargos(['admin']), UsuarioController.deletarVeterinario);

export default router;