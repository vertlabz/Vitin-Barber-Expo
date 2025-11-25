// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  // MESMA base que você já está usando e funciona
  baseURL: 'http://192.168.1.4:3000',
});

export function setApiToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
