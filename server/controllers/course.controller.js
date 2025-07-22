import mongoose from 'mongoose';
import { Order } from '../models/order.model.js';
import { Purchase } from '../models/purchase.model.js';
import { v2 as cloudinary } from 'cloudinary';
import Stripe from 'stripe';
import config from '../config.js';
import { Course } from '../models/course.model.js';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export const createCourse = async (req, res) => {
  const { title, description, price } = req.body;
  const adminId = req.adminId;
  console.log('Creating course - Received Data:', { title, description, price, files: req.files, adminId });

  try {
    if (!adminId) {
      console.log('No adminId found in request');
      return res.status(401).json({ errors: 'Unauthorized: No admin ID' });
    }

    if (!title || !description || !price) {
      console.log('Missing required fields:', { title, description, price });
      return res.status(400).json({ errors: 'Title, description, and price are required' });
    }

    let imageData = null;
    if (req.files && req.files.image) {
      const file = req.files.image;
      console.log('Uploading file to Cloudinary:', {
        fileName: file.name,
        tempFilePath: file.tempFilePath,
        size: file.size,
      });
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'course_images',
      });
      imageData = { public_id: result.public_id, url: result.secure_url };
      console.log('Cloudinary upload successful:', imageData);
    } else {
      console.log('No image file uploaded');
    }

    console.log('Creating new course object:', { title, description, price, creatorId: adminId, image: imageData });
    const newCourse = new Course({
      title,
      description,
      price: parseFloat(price),
      creatorId: adminId,
      image: imageData,
    });
    console.log('Saving course to database...');
    const savedCourse = await newCourse.save();
    console.log('Course saved successfully:', savedCourse);
    res.status(201).json({ message: 'Course created successfully', course: savedCourse });
  } catch (error) {
    console.error('Error creating course:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ errors: 'Error creating course', details: error.message });
  }
};

export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const adminId = req.adminId;
  console.log('Updating course - Course ID:', courseId, 'Admin ID:', adminId);

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ errors: 'Course not found' });
    }

    if (course.creatorId.toString() !== adminId) {
      console.log('Unauthorized: Admin ID mismatch:', adminId, 'Course creator:', course.creatorId);
      return res.status(403).json({
        error: "This course was created by another admin. You cannot update or delete it."
      });
    }

    const { title, description, price } = req.body;
    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price ? parseFloat(price) : course.price;

    if (req.files && req.files.image) {
      const file = req.files.image;
      console.log('Uploading updated file to Cloudinary:', file.name);
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'course_images',
      });
      course.image = { public_id: result.public_id, url: result.secure_url };
      console.log('Cloudinary upload result:', result);
    }

    const updatedCourse = await course.save();
    console.log('Update result:', updatedCourse);
    res.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error.message, error.stack);
    res.status(500).json({ errors: 'Error updating course', details: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  const adminId = req.adminId;
  console.log('Deleting course - Course ID:', courseId, 'Admin ID:', adminId);

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found for deletion:', courseId);
      return res.status(404).json({ errors: 'Course not found' });
    }

    if (course.creatorId.toString() !== adminId) {
      console.log('Unauthorized: Admin ID mismatch:', adminId, 'Course creator:', course.creatorId);
      return res.status(403).json({
        error: "This course was created by another admin. You cannot update or delete it."
      });
    }

    await Course.findByIdAndDelete(courseId);
    console.log('Course deleted successfully:', courseId);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error.message);
    res.status(500).json({ errors: 'Error deleting course' });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ errors: 'Server Error' });
  }
};

export const getCourseById = async (req, res) => {
  const { courseId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ errors: 'Invalid course ID' });
    }
    const course = await Course.findById(courseId).populate({ path: 'creatorId', select: 'firstName lastName _id' });
    if (!course) {
      return res.status(404).json({ errors: 'Course not found' });
    }
    // Flatten creatorId for easier frontend use
    const courseObj = course.toObject();
    if (courseObj.creatorId && typeof courseObj.creatorId === 'object') {
      courseObj.creatorId = courseObj.creatorId._id?.toString();
      courseObj.creatorName = course.creatorId.firstName + ' ' + course.creatorId.lastName;
    }
    res.json(courseObj);
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ errors: 'Server Error' });
  }
};

export const confirmPurchase = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { paymentIntentId, courseId } = req.body;
    console.log('Confirming purchase:', { userId, paymentIntentId, courseId });

    // Only retrieve the PaymentIntent, do not confirm it again
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Check if purchase already exists
    const existingPurchase = await Purchase.findOne({ userId, courseId, status: 'completed' });
    if (existingPurchase) {
      return res.status(400).json({ error: 'Course already purchased' });
    }

    // Only now create the Purchase
    const purchase = new Purchase({ userId, courseId, status: 'completed' });
    await purchase.save();

    res.status(201).json({ message: 'Purchase confirmed', purchase });
  } catch (error) {
    console.error('Error in confirmPurchase:', error.stack, error.message);
    res.status(500).json({ errors: 'Internal Server Error', details: error.message });
  }
};

export const buyCourse = async (req, res) => {
  const { courseId } = req.params;
  console.log('buyCourse called with courseId:', courseId);

  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ errors: 'Invalid course ID' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ errors: 'Unauthorized' });
    }
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: 'Course not found' });
    }

    // Only block if a completed purchase exists
    const existingPurchase = await Purchase.findOne({ userId, courseId, status: 'completed' });
    if (existingPurchase) {
      return res.status(400).json({ errors: 'Course already purchased' });
    }

    let customer = await stripe.customers.list({ email: req.user.email, limit: 1 });
    if (!customer.data.length) {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
      });
    } else {
      customer = customer.data[0];
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100),
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['card'],
      capture_method: 'automatic',
      metadata: { userId, courseId },
    });
    console.log('Payment Intent created:', paymentIntent);

    // DO NOT create a Purchase here!
    res.json({ course, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error in buyCourse:', error.stack);
    res.status(500).json({ errors: 'Internal Server Error', details: error.message });
  }
};