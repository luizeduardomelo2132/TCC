import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'chave_super_secreta_tcc_2026';

// GUARDA 1: Verifica se a pessoa está logada (tem Token)
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  // O padrão do mercado envia o token como: "Bearer eyJhbGciOi..."
  const token = authHeader.split(' ')[1];

  try {
    // Abre o crachá e lê as informações
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Salva o ID e o Cargo na requisição para podermos usar nas próximas etapas
    req.usuarioId = decoded.id; 
    req.usuarioRole = decoded.role; 
    
    next(); // Pode passar!
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// GUARDA 2: Verifica se o cargo tem permissão
export const apenasCargos = (cargosPermitidos) => {
  return (req, res, next) => {
    // Se o cargo do usuário NÃO estiver na lista de permitidos, barra o acesso
    if (!cargosPermitidos.includes(req.usuarioRole)) {
      return res.status(403).json({ 
        message: 'Erro 403: Você não tem permissão para realizar esta ação.' 
      });
    }
    next(); // Pode passar!
  };
};