import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use uma chave secreta segura, no mundo real isso fica no arquivo .env
const SECRET_KEY = process.env.JWT_SECRET || 'chave_super_secreta_tcc_2026';

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    // Verifica se o usuário já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    const novoUsuario = new Usuario({ nome, email, senha, role });
    await novoUsuario.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o usuário pelo e-mail
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Compara a senha digitada com a criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    
    // Gera o token de acesso (crachá virtual) válido por 1 dia
   const token = jwt.sign(
      { id: usuario._id, role: usuario.role }, 
      SECRET_KEY, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};