import express from 'express';
import { signup, login, logout, getPurchases } from '../controllers/user.controller.js';
import userMiddleware from '../middleware/user.mid.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/purchases', userMiddleware, getPurchases);

export default router;