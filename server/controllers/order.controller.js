import { Order } from '../models/order.model.js';
import { Purchase } from '../models/purchase.model.js';

export const orderData = async (req, res) => {
    const { email, userId, courseId, paymentId, amount, status } = req.body;

    // Validate input
    if (!email || !userId || !courseId || !paymentId || !amount || !status) {
        return res.status(400).json({ errors: 'Missing required fields' });
    }

    try {
        // Check for duplicate order
        const existingOrder = await Order.findOne({ paymentId });
        if (existingOrder) {
            return res.status(400).json({ errors: 'Order already exists' });
        }

        // Create order
        const orderInfo = await Order.create({ email, userId, courseId, paymentId, amount, status });
        if (!orderInfo) {
            return res.status(500).json({ errors: 'Order creation failed' });
        }

        // Create purchase
        const newPurchase = new Purchase({ userId, courseId });
        await newPurchase.save();

        console.log('Order created:', orderInfo);
        console.log('Purchase created:', newPurchase);
        return res.status(200).json({ message: 'Order and Purchase created successfully', orderInfo });
    } catch (error) {
        console.error('Error in Order creation:', error);
        return res.status(500).json({ errors: 'Error in Order creation' });
    }
};