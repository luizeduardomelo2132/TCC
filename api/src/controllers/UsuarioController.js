import Usuario from '../models/Usuario.js';
import Pet from '../models/Pet.js';
import Consulta from '../models/Consulta.js';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. GERENCIAMENTO GERAL / VETERINÁRIOS / ADMINS
// ==========================================

// Listar todos os usuários (Admin, Vets e Tutores)
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-senha');
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao listar usuários', detalhes: error.message });
  }
};

// Criar Usuário (Veterinário ou Admin) - Aceita especialidade!
// Criar Usuário (Veterinário ou Admin) - Aceita especialidade!
export const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role, telefone, endereco, especialidade } = req.body;

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senha || '123456',
      role: role || 'veterinario',
      telefone,
      endereco,
      especialidade: role === 'veterinario' ? especialidade : undefined,
      senhaTemporaria: true, // admin definiu a senha, então obriga troca no primeiro acesso
    });

    const usuarioFormatado = novoUsuario.toObject();
    delete usuarioFormatado.senha;

    return res.status(201).json(usuarioFormatado);
  } catch (error) {
    return res.status(400).json({ erro: 'Falha ao criar usuário', detalhes: error.message });
  }
};

// Atualizar Usuário Geral (Admin/Vet)
// Atualizar Usuário Geral (Admin/Vet)
export const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, endereco, especialidade, role, senha } = req.body;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.nome = nome ?? usuario.nome;
    usuario.email = email ?? usuario.email;
    usuario.telefone = telefone ?? usuario.telefone;
    usuario.endereco = endereco ?? usuario.endereco;
    usuario.especialidade = especialidade ?? usuario.especialidade;
    usuario.role = role ?? usuario.role;

    // Se o admin digitou uma nova senha na edição, atualiza e marca como temporária
    if (senha) {
      usuario.senha = senha;
      usuario.senhaTemporaria = true;
    }

    // .save() ativa o pre('save') que criptografa a senha quando ela for modificada
    await usuario.save();

    const usuarioFormatado = usuario.toObject();
    delete usuarioFormatado.senha;

    return res.status(200).json(usuarioFormatado);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao atualizar usuário', detalhes: error.message });
  }
};

// ==========================================
// LISTAR VETERINÁRIOS
// ==========================================

export const listarVeterinarios = async (req, res) => {
  try {
    const veterinarios = await Usuario.find({
      role: { $regex: /^veterinario$/i }
    })
      .select('nome email telefone especialidade')
      .sort({ nome: 1 });

    return res.status(200).json(veterinarios);

  } catch (error) {
    console.error('Erro ao listar veterinários:', error);

    return res.status(500).json({
      erro: 'Falha ao listar veterinários',
      detalhes: error.message
    });
  }
};

// Deletar Veterinário
export const deletarVeterinario = async (req, res) => {
  try {
    const { id } = req.params;

    const veterinario = await Usuario.findById(id);

    if (!veterinario) {
      return res.status(404).json({
        erro: 'Veterinário não encontrado'
      });
    }

    // Impede que essa rota exclua tutores ou administradores
    if (veterinario.role !== 'veterinario') {
      return res.status(400).json({
        erro: 'O usuário informado não é um veterinário'
      });
    }

    await Usuario.findByIdAndDelete(id);

    return res.status(200).json({
      mensagem: 'Veterinário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar veterinário:', error);

    return res.status(500).json({
      erro: 'Falha ao deletar veterinário',
      detalhes: error.message
    });
  }
};

// ==========================================
// 2. REGRAS ESPECÍFICAS DE TUTORES
// ==========================================

// Criar Tutor (feito pelo Admin) — nasce com senha temporária
export const criarTutor = async (req, res) => {
  try {
    const { nome, telefone, email, endereco } = req.body;

    const novoTutor = await Usuario.create({
      nome,
      email,
      telefone,
      endereco,
      role: 'tutor',
      senha: '123456',
      senhaTemporaria: true, // obriga a trocar no primeiro login
    });

    const tutorFormatado = novoTutor.toObject();
    delete tutorFormatado.senha;

    return res.status(201).json(tutorFormatado);
  } catch (error) {
    return res.status(400).json({ erro: 'Falha ao cadastrar tutor', detalhes: error.message });
  }
};
// Listar Apenas Tutores
export const listarTutores = async (req, res) => {
  try {
    const tutores = await Usuario.find({ role: 'tutor' }).select('-senha');
    return res.status(200).json(tutores);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao listar tutores', detalhes: error.message });
  }
};

// Obter Tutor por ID
export const obterTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Usuario.findById(id).select('-senha');

    if (!tutor) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }

    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao obter tutor', detalhes: error.message });
  }
};

// Atualizar Tutor
export const atualizarTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, endereco } = req.body;

    const tutor = await Usuario.findByIdAndUpdate(
      id,
      { nome, telefone, email, endereco },
      { new: true }
    ).select('-senha');

    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao atualizar tutor', detalhes: error.message });
  }
};

// Deletar Tutor com cascata para Pets e Consultas
export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca os pets do tutor para mapear os IDs antes de deletá-los
    const petsDoTutor = await Pet.find({
      $or: [{ tutorId: id }, { tutor: id }]
    });

    const petIds = petsDoTutor.map((pet) => pet._id);

    // 2. Se o tutor tiver pets, remove todas as consultas associadas a esses pets
    if (petIds.length > 0) {
      await Consulta.deleteMany({
        $or: [{ pet: { $in: petIds } }, { petId: { $in: petIds } }]
      });
    }

    // 3. Remove em cascata todos os pets do tutor
    await Pet.deleteMany({
      $or: [{ tutorId: id }, { tutor: id }]
    });

    // 4. Remove o tutor
    const tutor = await Usuario.findByIdAndDelete(id);

    if (!tutor) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }

    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao deletar tutor', detalhes: error.message });
  }

};

// ==========================================
// 3. MEU PERFIL (Usuário Logado)
// ==========================================

// Buscar os dados do próprio usuário para preencher a tela de perfil
export const obterMeuPerfil = async (req, res) => {
  try {
    // O ID vem do token JWT, setado pelo middleware verificarToken em req.usuarioId
    const usuario = await Usuario.findById(req.usuarioId).select('-senha');

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar perfil', detalhes: error.message });
  }
};


// Atualizar os próprios dados (Nome, Email, Telefone, Endereço)
export const atualizarMeuPerfil = async (req, res) => {
  try {
    const { nome, email, telefone, endereco } = req.body;

    // Note que não permitimos mudar a 'role' ou a 'especialidade' por aqui!
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuarioId,
      { nome, email, telefone, endereco },
      { new: true }
    ).select('-senha');

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar perfil', detalhes: error.message });
  }
};

// Trocar a própria senha
export const trocarMinhaSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Precisamos buscar o usuário SEM o ".select('-senha')" porque vamos comparar a senha
    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'A senha atual está incorreta.' });
    }

    usuario.senha = novaSenha;

    // .save() ativa o usuarioSchema.pre('save') que criptografa a nova senha
    await usuario.save();

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao trocar a senha', detalhes: error.message });
  }
};



// Define a nova senha no primeiro acesso (não exige senha atual,
// pois o usuário já provou identidade ao logar com a senha temporária)
export const definirNovaSenhaPrimeiroAcesso = async (req, res) => {
  try {
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const usuario = await Usuario.findById(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.senha = novaSenha;
    usuario.senhaTemporaria = false;

    await usuario.save();

    return res.status(200).json({ message: 'Senha definida com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao definir nova senha', detalhes: error.message });
  }
};