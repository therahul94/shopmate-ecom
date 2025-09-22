import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({name, email, password, confirmPassword}) => {
        set({loading: true});
        if(password !== confirmPassword) {
            return toast.error(`Passwords don't match`);
        }

        try {
            const res = await axios.post('/auth/signup', {
                name, email, password
            });

            set({user: res.data, loading: false});
        } catch (error) {
            set({loading: false}); 
            toast.error(error.response.data.message || error.response.data.error || "An error occured");
        }
    },

    login: async (email, password) => {
        set({loading: true});

        try {
            const res = await axios.post('/auth/login', {
                 email, password
            });

            set({user: res.data, loading: false});
        } catch (error) {
            set({loading: false}); 
            toast.error(error.response.data.message || error.response.data.error || "An error occured");
        }
    },

    logout: async () => {
        try {
            await axios.post('/auth/logout');
            set({user: null});
        } catch (error) {
            toast.error(error.response.data.message || error.response.data.error || "An error occured");
        }
    },

    checkAuth: async() => {
        set({checkingAuth: true});
        try {
            const response = await axios.get('/auth/profile');
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            set({checkingAuth: false, user: null});
        }
    },

    refreshToken: async() => {
        // Prevent multiple simultaneous refresh attampts
        if(get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const res = await axios.post('/auth/refresh-token');
            set({checkingAuth: false});
            return res.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    }

}))

// TODO: Implement the axios interceptors for refreshing the access tokens.


// axios interceptor for token refresh
let refreshPromise = null;
axios.interceptors.response.use(
    // if nothing wrong, we have access token then below line will run only.
    (response) => response,
    // otherwise if we don't have the access token then below logic will run.
    async (error) => {
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 

            try {
                // if refresh is already in progress, wait for it to complete
                if(refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest); // hold the original request, original req: addToCart or adding a product.
                }

                // start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;
                return axios(originalRequest);// hold the original request, original req: addToCart or adding a product.
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed.
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }

        }
        return Promise.reject(error);
    }
);

