import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api', // from the browser's perspective, everything appears to be happening on localhost:5173, The actual forwarding to localhost:5000 happens on the server side (Vite dev server), which doesn't have CORS restrictions.
    withCredentials: true // send cookies to the server.
});

export default axiosInstance;