import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        default: "",
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    category: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        required:false
    }

}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);
export default Product;