// src/services/api.ts
import axios from 'axios';

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
});

export function setApiToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
