import axios from 'axios';
import { API_BASE_URL } from '@env';

const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


export default api;