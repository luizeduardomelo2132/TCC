import axios from 'axios';

// Criamos uma instância do Axios apontando para o seu Back-end
const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

export default api;