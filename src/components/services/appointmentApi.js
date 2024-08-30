import axios from 'axios';

const appointmentApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export default appointmentApi;