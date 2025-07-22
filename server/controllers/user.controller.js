import { User } from '../models/user.model.js';
import { Purchase } from '../models/purchase.model.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const schema = z.object({
    firstName: z.string().min(3, { message: 'First Name must be at least 3 characters long' }),
    lastName: z.string().min(3, { message: 'Last Name must be at least 3 characters long' }),
    email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  });

  const validationResult = schema.safeParse(req.body);
  if (validationResult.error) {
    return res.status(400).json({ errors: validationResult.error.issues.map(err => err.message) });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: 'User already exists' });
    }
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful', newUser });
  } catch (error) {
    return res.status(500).json({ errors: 'Server Error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ errors: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ errors: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, firstName: existingUser.firstName, lastName: existingUser.lastName },
      config.JWT_USER_PASSWORD,
      { expiresIn: '1d' }
    );

    const cookieOption = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    };

    res.cookie('jwt', token, cookieOption);
    res.status(200).json({ message: 'Logged in successfully', existingUser, token });
  } catch (error) {
    res.status(500).json({ errors: 'Error in login', error: error.message });
    console.log(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.send({ message: 'Logged out successfully' });
};

export const getPurchases = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ errors: "User not authenticated" });
    }

    const userId = req.user._id;
    const purchases = await Purchase.find({ userId, status: 'completed' }).populate('courseId');
    // Defensive: filter out any purchase with missing or null courseId or missing _id
    const validPurchases = purchases.filter(p => p.courseId && p.courseId._id);

    res.json({
      message: 'Purchased courses retrieved successfully',
      purchasedCourses: validPurchases.map(p => ({
        _id: p.courseId._id,
        title: p.courseId.title,
        description: p.courseId.description,
        price: p.courseId.price,
        image: p.courseId.image,
      })),
      rawPurchases: validPurchases,
    });
  } catch (error) {
    res.status(500).json({
      errors: 'Internal Server Error',
      details: error.message,
    });
  }
};