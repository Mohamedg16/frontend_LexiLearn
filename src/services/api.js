import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
            const isAuthRequest = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token');

            if (!isLoginPage && !isAuthRequest) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                return new Promise((resolve, reject) => {
                    console.log('🔄 Session expired. Attempting token regeneration...');
                    axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
                        .then((res) => {
                            if (res.data.success) {
                                const { accessToken } = res.data.data;
                                localStorage.setItem('token', accessToken);
                                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                                processQueue(null, accessToken);
                                resolve(api(originalRequest));
                            } else {
                                throw new Error('Refresh failed');
                            }
                        })
                        .catch((refreshError) => {
                            console.log('❌ Terminal authentication failure. Evicting session...');
                            localStorage.removeItem('token');
                            processQueue(refreshError, null);
                            // Only redirect if we haven't already
                            if (window.location.pathname !== '/') {
                                window.location.href = '/';
                            }
                            reject(refreshError);
                        })
                        .finally(() => {
                            isRefreshing = false;
                        });
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
