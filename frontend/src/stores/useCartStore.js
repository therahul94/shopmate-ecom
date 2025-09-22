import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getCartItems: async () => {
        try {
            const response = await axios.get("/cart");
            set({ cart: response.data });
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] });
            // toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },

    addToCart: async (product) => {
        try {
            await axios.post("/cart", {
                productId: product._id
            });
            toast.success("Added to cart");

            // now set the cart array.
            // to set the cart array, first we have ensure if the product is available or not, if 
            // it is available then just increase the count by one otherwise add the product in the cart.
            set((prevState) => {
                const existingItem = prevState.cart.find(item => item._id === product._id);
                const newCart = existingItem ?
                    prevState.cart.map(cartItem =>
                        cartItem._id === product._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)
                    : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] });
            toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },

    removeFromCart: async (productId) => {
        try {
            await axios.delete('/cart', {
                data: { productId }
            });
            // set the cart
            set((prevState) => ({
                cart: prevState.cart.filter(item => item._id !== productId)
            }));
            get().calculateTotals();
        } catch (error) {
            toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },

    clearCart: async () => {
        set({cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false})
    },

    updateQuantity: async (productId, quantity) => {
        try {
            if (quantity === 0) {
                get().removeFromCart(productId);
                return;
            }
            await axios.put(`/cart/${productId}`, { quantity });
            set((prevState) => ({
                cart: prevState.cart.map(item => item._id === productId ? { ...item, quantity: quantity } : item)
            }))
            get().calculateTotals();
        } catch (error) {
            toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },

    calculateTotals: () => {
        const { cart, coupon } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if (coupon) {
            // if coupon exist then calculate the discount and reduce the discount amount from the subtotal to get the actual total.
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal-discount;

        }
        set({ total, subtotal });
    },
    
    getMyCoupon: async() => {
        try {
            const res = await axios.get('/coupons');
            set({coupon: res.data})
        } catch (error) {
            console.log("Error fetching coupon: " + error);
        }
    },

    applyCoupon: async(code) => {
        try {
            const response = await axios.post('/coupons/validate', {code});
            set({coupon: response.data, isCouponApplied: true})
            get().calculateTotals();
            return toast.success("Coupon applied successfully");
        } catch (error) {
            return toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },
    
    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
        toast.success("Coupon removed");
    }
    
}))
