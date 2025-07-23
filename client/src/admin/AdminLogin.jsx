import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../../public/logo.webp'; // Ensure the logo file exists in the public folder
import { BACKEND_URL } from '../utils/utils';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            localStorage.removeItem('admin');
            const response = await axios.post(
                `${BACKEND_URL}/admin/login`,
                { email, password },
                { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );
            if (response.data.token) {
                // Store both token and admin id for permission checks
                localStorage.setItem('admin', JSON.stringify({ token: response.data.token, id: response.data.existingAdmin._id }));
            } else {
                throw new Error('No token received from server');
            }
            toast.success('Login successful');
            navigate('/admin/dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.msg || 'Error logging in';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-black to-blue-950 min-h-screen">
            <div className="min-h-screen container mx-auto flex items-center justify-center text-white px-2 sm:px-4">
                <header className="absolute top-0 left-0 w-full flex flex-col sm:flex-row justify-between items-center p-3 sm:p-5 gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2">
                        <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
                        <Link to="/" className="text-lg sm:text-xl font-bold text-orange-500">
                            CourseHaven
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link
                            to="/admin/signup"
                            className="bg-transparent border border-gray-500 p-1 text-xs sm:text-sm md:text-md md:py-2 md:px-4 rounded-md"
                        >
                            Signup
                        </Link>
                        <Link
                            to="/courses"
                            className="bg-orange-500 p-1 text-xs sm:text-sm md:text-md md:py-2 md:px-4 rounded-md"
                        >
                            Join now
                        </Link>
                    </div>
                </header>

                <div className="bg-gray-900 p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg m-4 md:m-0 mt-20">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
                        Welcome to <span className="text-orange-500">CourseHaven</span>
                    </h2>
                    <p className="text-center text-gray-400 mb-6 text-sm sm:text-base">
                        Admin Login
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
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                    placeholder="********"
                                    autoComplete="current-password"
                                    required
                                />
                                <span
                                    className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        {errorMessage && (
                            <div className="mb-4 text-red-500 text-center">
                                {errorMessage}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;