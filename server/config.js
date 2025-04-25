import dotenv from 'dotenv';
dotenv.config();

const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY ;

// console.log('Loaded JWT_USER_PASSWORD:', JWT_USER_PASSWORD);

export default {
    JWT_USER_PASSWORD: process.env.JWT_USER_PASSWORD ,
    JWT_ADMIN_PASSWORD: process.env.JWT_ADMIN_PASSWORD,
    STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY
};