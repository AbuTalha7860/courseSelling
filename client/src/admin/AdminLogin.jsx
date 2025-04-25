import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../../public/logo.webp'; // Ensure the logo file exists in the public folder
import { BACKEND_URL } from '../utils/utils';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Clear any existing admin token to avoid conflicts
            localStorage.removeItem('admin');
            console.log('Cleared existing admin token from localStorage');

            const response = await axios.post(
                `${BACKEND_URL}/admin/login`,
                { email, password },
                { withCredentials: true }
            );
            console.log('Login response:', response.data);

            // Store the token in localStorage
            if (response.data.token) {
                localStorage.setItem('admin', JSON.stringify({ token: response.data.token }));
                console.log('Stored new admin token in localStorage:', response.data.token);
            } else {
                throw new Error('No token received from server');
            }

            toast.success('Login successful');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Error logging in:', error);
            toast.error(error.response?.data?.msg || 'Error logging in');
        }
    };

    return (
        <div className="bg-gradient-to-r from-black to-blue-950">
            <div className="h-screen container mx-auto flex items-center justify-center text-white">
                {/* Header */}
                <header className="absolute top-0 left-0 w-full flex justify-between items-center p-5">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
                        <Link to="/" className="text-xl font-bold text-orange-500">
                            CourseHaven
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/admin/signup"
                            className="bg-transparent border border-gray-500 py-2 px-4 rounded-md"
                        >
                            Signup
                        </Link>
                        <Link
                            to="/courses"
                            className="bg-orange-500 py-2 px-4 rounded-md"
                        >
                            Join now
                        </Link>
                    </div>
                </header>

                {/* AdminLogin Form */}
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[500px] mt-20">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Welcome to <span className="text-orange-500">CourseHaven</span>
                    </h2>
                    <p className="text-center text-gray-400 mb-6">
                        Log in to access admin dashboard!
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label htmlFor="email" className="text-gray-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="name@email.com"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="********"
                                    required
                                />
                                <span className="absolute right-3 top-3 text-gray-500 cursor-pointer">
                                    👁️
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;