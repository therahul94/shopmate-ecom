import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    // generate access token
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    // generate refresh token
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
}

function setCookies(res, accessToken, refreshToken) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attack, cross-site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent CSRF attack, cross-site request forgery
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}

export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const userExists = await User.findOne({ email }); //1238494
        if (userExists) return res.status(400).json({ message: "user already exists" });
        const newUser = await User.create({ email, password, name });
        // authenticate
        const { accessToken, refreshToken } = generateToken(newUser._id);
        // store refresh token in the REDIS.
        storeRefreshToken(newUser._id, refreshToken);
        // adding tokens to the cookies.
        setCookies(res, accessToken, refreshToken);
        return res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        return res.status(500).json({ message: error.message });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            // generate access token and refresh token
            // set refresh token to the redis
            // set access token and refresh token in the cookies.

            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })

        } else {
            return res.status(401).json({ message: "Invalid E-mail or Password" });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token is provided" });
        }
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // get the refresh token stored in the redis, and match with the provided refresh token.
        const storedRefreshToken = await redis.get(`refresh_token:${decode.userId}`);
        if (storedRefreshToken !== refreshToken) {
            return res.status(401).json({ message: "refresh token is invalid" });
        }
        // if refresh token is valid then create access token and store it in the cookies.
        const accessToken = jwt.sign({ userId: decode.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })
        return res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        return res.json(req.user);
    } catch (error) {
        console.log("Error in getProfile Controller", error.message);
        return res.status(500).json({"message" : "Server Error", error: error.message});
    }
}