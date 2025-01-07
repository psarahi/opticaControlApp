import axios from 'axios';

export const opticaControlApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

