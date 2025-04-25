import express from 'express';
import { createCourse, updateCourse, deleteCourse, getCourses, getCourseById, buyCourse, confirmPurchase } from '../controllers/course.controller.js';
import adminMiddleware from '../middleware/admin.mid.js';
import userMiddleware from '../middleware/user.mid.js';

const router = express.Router();

router.post('/', adminMiddleware, createCourse);
router.put('/update/:courseId', adminMiddleware, updateCourse);
router.delete('/:courseId', adminMiddleware, deleteCourse);
router.get('/', getCourses);
router.get('/:courseId', getCourseById);
router.post('/buy/:courseId', userMiddleware, buyCourse);
router.post('/confirm', userMiddleware, confirmPurchase);

export default router;