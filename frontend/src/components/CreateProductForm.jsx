import { motion } from 'framer-motion'
import { useState } from 'react';
import { Loader, PlusCircle, Upload } from 'lucide-react';
import { useProductStore } from '../stores/useProductStore'

const categories = ["jeans", "tshirts", "shoes", "glasses", "jackets", "suits", "bags"];
const CreateProductForm = () => {
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: ""
    })
    const { createProduct, loading } = useProductStore();
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setNewProduct({ ...newProduct, image: reader.result })
                }
            }
            reader.readAsDataURL(file);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        /*
            https://www.amazon.in/Lymio-Jackets-Lightweight-Outwear-J-06-Green-M/dp/B0FMDKQMCS/ref=sr_1_5?crid=227QR3MW1G062&dib=eyJ2IjoiMSJ9.7295P8LFXY450QG9iBdL7jqJ3qso9YVjUkMF0lLZJ_ncxt11s-fURlDou-EqdZXN4suvt3TmBC8_E5EpGHh3boMoJxabe5N1sT4cMv09GC0B6sqwoFJ0MtnPxdf_Vg-sEnf3UY6jTJ5kwPsF9zFS1de4k5LMbuEUzNkl_CA8zHHdYQXicqgeIglkQgsq3-WE9fe2b7l5Utk_xnkWnrzeg5avDhvZg2gEp8vuUtj-p3MRg5uQhmmyGYsoYvuk0DesCL6qRdDSvumE9eHQ62gmnIgMkqat5KFcFzxPCnVRbrc.5vuEvootmXBpJsGXWh1FKPZ8IAf9p7fnelEWweEaPSs&dib_tag=se&keywords=jackets%2Bfor%2Bmen%2Bstylish%2Blatest&qid=1757479151&sprefix=Jacke%2Caps%2C317&sr=8-5&th=1&psc=1
        */
        try {
            await createProduct(newProduct);
            setNewProduct({
                name: "",
                description: "",
                price: "",
                category: "",
                image: ""
            });
        } catch (error) {
            console.log("Error creating a product");
        }
    }

    return (
        <motion.div
            className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Create New Product</h2>
            <form onSubmit={handleSubmit} className='space-y-3'>
                <div>
                    <label htmlFor="name" className='block text-sm font-medium text-gray-300'>
                        Product Name
                    </label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                        <input
                            id="name"
                            type="text"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className='block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                            placeholder="Full Sleeves Jacket"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor='description' className='block text-sm font-medium text-gray-300'>
                        Description
                    </label>
                    <textarea
                        id='description'
                        name='description'
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows='3'
                        className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
						 focus:border-emerald-500'
                        required
                    />
                </div>
                <div>
                    <label htmlFor='price' className='block text-sm font-medium text-gray-300'>
                        Price
                    </label>
                    <input
                        type='number'
                        id='price'
                        name='price'
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        step='0.01'
                        className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
						 focus:border-emerald-500'
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className='block text-sm font-medium text-gray-300'>
                        Category
                    </label>
                    <select
                        name="category"
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md 
                        shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
                        focus:border-emerald-500'
                        required
                    >
                        <option value="">Select a category</option>
                        {categories &&
                            categories.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))
                        }
                    </select>
                </div>
                <div className='mt-1 flex items-center'>
                    {/* sr-only so upload input will not be visible */}
                    <input type="file" id='image' className='sr-only' accept='image/*' onChange={handleImageChange} />
                    <label
                        htmlFor="image"
                        className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600
                        rounded-md shadow-md text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                    >
                        <Upload className='h-5 w-5 inline-block mr-2' />
                        Upload Image
                    </label>
                    {newProduct.image && <span className='ml-3 text-sm text-gray-400'>Image Uploaded</span>}
                </div>
                <button
                    type='submit'
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                    shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50'
                    disabled={loading}
                >
                    {
                        loading ? (
                            <>
                                <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                Loading...
                            </>
                        ) : (
                            <>
                                <PlusCircle className='mr-2 h-5 w-5' />
                                Create Product
                            </>
                        )
                    }
                </button>
            </form>
        </motion.div>
    )
}

export default CreateProductForm
