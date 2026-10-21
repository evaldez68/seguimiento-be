// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://talleres-production-7cc1.up.railway.app", // 
});

export default api;