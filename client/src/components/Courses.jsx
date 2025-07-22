import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API call
import { FaCircleUser } from "react-icons/fa6";
import { RiHome2Fill } from "react-icons/ri";
import { FaDiscourse } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { HiMenu, HiX } from "react-icons/hi"; // Import menu and close icons
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import Loader from './Loader';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Check for token in local storage
    useState(() => {
        const token = localStorage.getItem('user');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    // Logout function
    const handleLogout = async () => {
        try {
            const response = await axios.get("http://localhost:3100/api/user/logout", {
                withCredentials: true
            });
            toast.success(response.data.message);
            setIsLoggedIn(false);
            localStorage.removeItem('user'); // Remove the token from local storage
        } catch (error) {
            console.log("Error logging out", error);
            toast.error(error.response?.data?.errors || "Error logging out");
        }
    };

    // Fetch courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/courses/`, {
                    withCredentials: true
                });
                console.log("Courses fetched successfully", response.data);
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                console.log("Error fetching courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Toggle sidebar for mobile devices
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex">
            {/* Hamburger menu button for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-20 text-3xl text-gray-800"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <HiX /> : <HiMenu />} {/* Toggle menu icon */}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-gray-100 w-64 p-5 transform z-10 transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:static`}
            >
                <div className="flex items-center mb-10 mt-10 md:mt-0">
                    <img src={logo} alt="Profile" className="rounded-full h-12 w-12" />
                </div>
                <nav>
                    <ul>
                        <li className="mb-4">
                            <a href="/" className="flex items-center">
                                <RiHome2Fill className="mr-2" /> Home
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="flex items-center text-blue-500">
                                <FaDiscourse className="mr-2" /> Courses
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="/purchases" className="flex items-center">
                                <FaDownload className="mr-2" /> Purchases
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="flex items-center">
                                <IoMdSettings className="mr-2" /> Settings
                            </a>
                        </li>
                        <li>
                            {isLoggedIn ? (
                                <Link
                                    to={"/"}
                                    className="flex items-center"
                                    onClick={handleLogout}
                                >
                                    <IoLogOut className="mr-2" /> Logout
                                </Link>
                            ) : (
                                <Link to={"/login"} className="flex items-center">
                                    <IoLogIn className="mr-2" /> Login
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className="ml-0 md:ml-64 w-full bg-white p-10">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-xl font-bold">Courses</h1>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Type here to search..."
                                className="border border-gray-300 rounded-l-full px-4 py-2 h-10 focus:outline-none"
                            />
                            <button className="h-10 border border-gray-300 rounded-r-full px-4 flex items-center justify-center">
                                <FiSearch className="text-xl text-gray-600" />
                            </button>
                        </div>
                        <FaCircleUser className="text-4xl text-blue-600" />
                    </div>
                </header>

                {/* Vertically Scrollable Courses Section */}
                <div className="overflow-y-auto h-[75vh]">
                    {loading ? (
                        <Loader />
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10">
                            <p className="text-center text-gray-500 text-lg mb-4">
                                No courses available yet. Please check back later!
                            </p>
                            <Link
                                to="/"
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                            >
                                Go to Home
                            </Link>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl flex flex-col justify-between"
                                >
                                    {course.image?.url ? (
                                        <img
                                            src={course.image.url}
                                            alt={course.title}
                                            className="rounded-xl mb-4 h-48 w-full object-cover shadow-sm transition-all duration-300"
                                        />
                                    ) : (
                                        <div className="rounded-xl mb-4 bg-gray-200 h-48 flex items-center justify-center text-gray-400 text-lg">
                                            No Image Available
                                        </div>
                                    )}
                                    <h2 className="font-bold text-xl mb-2 text-blue-900 transition-all duration-300">{course.title}</h2>
                                    <p className="text-gray-600 mb-4 text-sm transition-all duration-300">
                                        {course.description.length > 100
                                            ? `${course.description.slice(0, 100)}...`
                                            : course.description}
                                    </p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-2xl text-orange-600 transition-all duration-300">
                                            ₹{course.price}
                                        </span>
                                        <span className="text-gray-400 line-through text-lg transition-all duration-300">₹5999</span>
                                        <span className="text-green-600 font-semibold ml-2 transition-all duration-300">20% off</span>
                                    </div>
                                    <Link
                                        to={`/buy/${course._id}`}
                                        className="bg-gradient-to-r from-orange-500 to-orange-700 w-full text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-900 hover:shadow-lg transition-all duration-300 text-center font-semibold tracking-wide mt-auto focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        Buy Now
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Courses;
