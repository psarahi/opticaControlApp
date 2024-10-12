import axios from 'axios';

export const appointmentApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

