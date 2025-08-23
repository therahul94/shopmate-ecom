import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json({ products });
    } catch (error) {
        console.log("Error in get all products controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        // first check in redis, if the featured products are available.
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }
        // if the featured products is not available in the redis then fetch from mongodb
        //.lean() is going to return plain JS object instead of a mongodb document, which is good 
        // for performance.
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }
        // store in redis for future quick access.
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        return res.status(200).json({ featuredProducts });

    } catch (error) {
        console.log("Error in get featured products controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader
                .upload(image, {
                    folder: "products"
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url: "",
            category
        })
        return res.status(201).json(product);
    } catch (error) {
        console.log("Error in create products controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({message: "product not found!"});
        }
        // delete the image of the deleting product also from cloudinary.
        if(product.image) {
            // find the public id of the image.
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary", error);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({message: "Product deleted successfully"});
    } catch (error) {
        console.log("Error in delete product controller", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getRecommendedProducts = async(req, res) =>{
    try {
        const products = await Product.aggregate([
            {
                $sample: {size: 3}
            }, {
                $project: {
                    _id: 1, 
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }
            }
        ]);
        res.json(products);

    } catch (error) {
        console.log("Error in get recommended product controller", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const getProductsByCategory = async(req, res) => {
    try {
        const products = await Product.find({category: req.params.category});
        if(!products) {
            return res.status(404).json({message: "Products not found!"});
        }
        res.json(products);
    } catch (error) {
        console.log("Error in get products by category controller", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

export const toggleFeaturedProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({message: "Product not found"});
        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        // update featured product cache.
        await updateFeaturedProductCache();
        return res.json(updatedProduct);

    } catch (error) {
        console.log("Error in the toggle featured products controller", error.message);
        return res.status(500).json({message: "Server Error", error: error.message});
    }
}

const updateFeaturedProductCache = async()=>{
    try {
        const products = await Product.find({isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(products));
    } catch (error) {
        console.log("Error in update cache function");
    }
}