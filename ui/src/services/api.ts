import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api', 
});

// vai rodar antes de toda requisição sair do Front-end
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TCC:token');
  
  if (token) {
    // Cola o crachá no cabeçalho da requisição
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;