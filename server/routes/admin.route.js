import express from 'express';
import { login, logout, signup, getDashboardStats } from '../controllers/admin.controller.js';

const router = express.Router();



router.post('/signup', signup);
router.post('/login' , login);
router.get('/logout', logout);
router.get('/dashboard-stats', getDashboardStats);

export default router;