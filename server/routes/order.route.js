import express from 'express';
import { orderData } from '../controllers/order.controller.js';
import userMiddleware from '../middleware/user.mid.js';

const router = express.Router();
router.post('/', userMiddleware, orderData);

export default router;