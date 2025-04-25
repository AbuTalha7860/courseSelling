import { Admin } from "../models/admin.model.js";
import bcrypt from 'bcryptjs';
import { z } from "zod";
import jwt from 'jsonwebtoken';
import config from "../config.js";

export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashesPassword = await bcrypt.hash(password, 10);

    // Validate input using zod schema
    const schema = z.object({
        firstName: z.string().min(3, { message: 'First Name must be at least 3 characters long' }),
        lastName: z.string().min(3, { message: 'Last Name must be at least 3 characters long' }),
        email: z.string().email(),
        password: z.string().min(8, { message: 'Password must be at least 6 characters long' })
    });
    const validationResult = schema.safeParse(req.body);
    if (validationResult.error) {
        return res.status(400).json({ errors: validationResult.error.issues.map(err => err.message) });
    }

    try {
        const existingAdmin = await Admin.findOne({ email: email });
        if (existingAdmin) {
            return res.send({ msg: 'Admin already exists' });
        }
        const newAdmin = new Admin({ 
            firstName, 
            lastName, 
            email, 
            password: hashesPassword
        });
        await newAdmin.save();
        res.send({ msg: 'Signup successfully', newAdmin });
    } catch (error) {
        return res.send({ msg: 'Server Error' });
    }
};

export const login = async (req, res) => {
    // Check if user is already logged in
    if (req.cookies && req.cookies.jwt) {
        try {
            const decoded = jwt.verify(req.cookies.jwt, config.JWT_ADMIN_PASSWORD);
            if (decoded) {
                return res.status(400).json({ msg: 'You are already logged in' });
            }
        } catch (error) {
            // If token is expired or invalid, allow login again
        }
    }

    const { email, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email: email });
        if (!existingAdmin) {
            return res.status(404).json({ msg: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, existingAdmin.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Incorrect password' });
        }

        // Generate new JWT token
        console.log('Admin Login - Using JWT_ADMIN_PASSWORD:', config.JWT_ADMIN_PASSWORD); // ✅ Added logging
        const token = jwt.sign(
            { id: existingAdmin._id }, 
            config.JWT_ADMIN_PASSWORD,
            { expiresIn: "1d" }
        );
        console.log('Admin Login - Generated Token:', token); // ✅ Added logging

        const cookieOption = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax"
        };

        res.cookie("jwt", token, cookieOption);
        res.json({ msg: 'Logged in successfully', existingAdmin, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error in login', error });
    }
};

export const logout = (req, res) => {
    if (!req.cookies || !req.cookies.jwt) {
        return res.send({ msg: 'Kindly login first' });
    }
    
    res.clearCookie("jwt");
    res.send({ msg: 'Logged out successfully' });
};