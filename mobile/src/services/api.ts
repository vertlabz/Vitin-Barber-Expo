import axios from "axios";

// Se você ainda não configurou env, deixe um fallback.
// Depois a gente troca para EXPO_PUBLIC_API_BASE_URL certinho.
const baseURL = "https://beck-pied.vercel.app";

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
