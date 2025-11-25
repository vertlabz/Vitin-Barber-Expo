// src/services/api.ts
import axios from 'axios';

// Em desenvolvimento: IP da sua máquina na mesma rede do celular/emulador
// Em produção: URL da API em produção (Railway, Render, AWS, etc.)
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://172.31.3.200:3000',
});

// Função auxiliar para setar/remover token
export function setApiToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
