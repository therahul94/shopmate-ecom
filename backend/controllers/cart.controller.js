import Product from "../models/product.model.js";

export const addToCart = async(req, res) => {
    const {productId} = req.body;
    try {
        const user = req.user;
        const existingProduct = user.cartItems.find(item => item.id === productId);
        if(existingProduct) {
            existingProduct.quantity += 1;
        }
        else {
            user.cartItems.push(productId);
        }
        await user.save();
        return res.json(user.cartItems);
    } catch (error) {
        console.log("Error in the add to cart controller ", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}
export const removeAllFromCart = async(req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        if(!productId) {
            user.cartItems = [];
        }else {
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }
        await user.save();
        return res.json(user.cartItems);
    } catch (error) {
        console.log("Error in the removeAllFromCart controller ", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getCartProducts = async(req, res) => {
    try {
        const user = req.user;
        const products = await Product.find({_id: {$in: user.cartItems}});
        // add quantity to each product 
        const cartItems = products.map(product => {
            const item = user.cartItems.find(item => item.id === product.id);
            return {...product.toJSON(), quantity: item.quantity};
        });

        return res.json(cartItems);
    } catch (error) {
        console.log("Error in the getCartProducts controller ", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}
export const updateQuantity = async(req, res) => {
    try {
        const {id: productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem){
            if(quantity === 0) {
                // remove the product from the cart.
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
            }
            else {
                existingItem.quantity = quantity;
            }
            await user.save();
            return res.json(user.cartItems);
        }else {
            return res.status(404).json({message: "Product not found"});
        }
    } catch (error) {
        console.log("Error in the updateQuantity controller ", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}