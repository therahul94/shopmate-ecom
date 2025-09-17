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
}))
