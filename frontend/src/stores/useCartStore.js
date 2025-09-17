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

    updateQuantity: async (productId, quantity) => {
        try {
            if (quantity === 0) {
                get().removeFromCart(productId);
                return;
            }
            await axios.put(`/cart/${productId}`, {quantity});
            set((prevState) => ({
                cart: prevState.cart.map(item => item._id === productId ? {...item, quantity: quantity} : item)
            }))
            get().calculateTotals();
        } catch (error) {
            toast.error((error.response.data.message + "\n" + error.response.data.error) || "An error occured");
        }
    },

    calculateTotals: () => {
        const { cart, coupon } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal;

        if (coupon) {
            // if coupon exist then calculate the discount and reduce the discount amount from the subtotal to get the actual total.
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }
        set({ total, subtotal });
    },
}))
