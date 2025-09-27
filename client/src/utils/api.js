import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  // You can add headers or interceptors here
});

export default api;
