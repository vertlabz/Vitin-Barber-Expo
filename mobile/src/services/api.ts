// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  // TROCA pelo IP público ou domínio da sua API
  baseURL: 'http://192.168.1.4:3000',
});

