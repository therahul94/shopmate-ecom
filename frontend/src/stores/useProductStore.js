import { create } from 'zustand';
import { toast } from 'react-hot-toast'
import axios from '../lib/axios'

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    recommendations: [],

    setProducts: (products) => set({ products }),
    createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axios.post('/product', productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false
            }))
        } catch (error) {
            set({ loading: false });
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured");
        }
    },
    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/product');
            set({ products: res.data.products, loading: false })
        } catch (error) {
            set({ loading: false });
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured");
        }
    },
    deleteProduct: async (productid) => {
        set({ loading: true });
        try {
            await axios.delete(`/product/${productid}`);
            set((prevState) => ({
                products: prevState.products.filter(item => item._id !== productid),
                loading: false
            }));
        } catch (error) {
            set({ loading: false });
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured");
        }
    },
    toggleFeaturedProduct: async(productId) => {
        set({ loading: true });
        try {
            const res = await axios.patch(`/product/${productId}`);
            set((prevState) => ({
                products: prevState.products.map(item => 
                    item._id === productId ? {...item, isFeatured: res.data.isFeatured} : item
                ),
                loading: false
            }))
        } catch (error) {
            set({ loading: false });
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured");
        }
    },
    fetchProductsByCategory: async(category) => {
        set({loading: true});
        try {
            const res = await axios.get(`/product/category/${category}`)
            set({ products: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured");
        }
    },
    fetchRecommendedProducts: async() => {
        set({loading: true});
        try {
            const res = await axios.get('/product/recommendations');
            set({recommendations: res.data});
        } catch (error) {
            set({recommendations: []});
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An Error Occured")
        } finally {
            set({loading: false});
        }
    }

}))