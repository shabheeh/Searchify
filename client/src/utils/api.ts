import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log(BASE_URL, "base")

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

