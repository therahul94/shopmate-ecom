import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js'
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);

app.listen(PORT, ()=>{
    console.log("server is running on http://localhost:"+PORT);
    connectDB();
});