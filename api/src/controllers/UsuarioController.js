import Usuario from '../models/Usuario.js';
import Pet from '../models/Pet.js';
import Consulta from '../models/Consulta.js';

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
export const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role, telefone, endereco, especialidade } = req.body;

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senha || '123456', // Se não enviar senha, define padrão
      role: role || 'veterinario',
      telefone,
      endereco,
      especialidade: role === 'veterinario' ? especialidade : undefined
    });

    // Remove a senha do objeto de retorno por segurança
    const usuarioFormatado = novoUsuario.toObject();
    delete usuarioFormatado.senha;

    return res.status(201).json(usuarioFormatado);
  } catch (error) {
    return res.status(400).json({ erro: 'Falha ao criar usuário', detalhes: error.message });
  }
};

// Atualizar Usuário Geral (Admin/Vet)
export const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, endereco, especialidade, role } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { nome, email, telefone, endereco, especialidade, role },
      { new: true }
    ).select('-senha');

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao atualizar usuário', detalhes: error.message });
  }
};


// ==========================================
// 2. REGRAS ESPECÍFICAS DE TUTORES
// ==========================================

// Criar Tutor
export const criarTutor = async (req, res) => {
  try {
    const { nome, telefone, email, endereco } = req.body;

    const novoTutor = await Usuario.create({
      nome,
      email,
      telefone,
      endereco,
      role: 'tutor',
      senha: '123456'
    });

    return res.status(201).json(novoTutor);
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
    // O ID vem do token JWT, que o seu middleware de autenticação deve colocar no req
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');

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

    // Usamos findByIdAndUpdate para coisas simples, tirando a senha do retorno
    // Note que não permitimos mudar a 'role' ou a 'especialidade' por aqui!
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { nome, email, telefone, endereco },
      { new: true }
    ).select('-senha');

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar perfil', detalhes: error.message });
  }
};

// Trocar a própria senha
export const trocarMinhaSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // 1. Precisamos buscar o usuário SEM o ".select('-senha')" porque vamos comparar a senha
    const usuario = await Usuario.findById(req.usuario.id);

    // 2. Compara a senha digitada com a que está salva no banco
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'A senha atual está incorreta.' });
    }

    // 3. Define a nova senha
    usuario.senha = novaSenha;

    // 4. Salva usando .save()! Isso é crucial para ativar o seu usuarioSchema.pre('save')
    // que vai criptografar a nova senha antes de jogar no banco.
    await usuario.save();

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao trocar a senha', detalhes: error.message });
  }
};