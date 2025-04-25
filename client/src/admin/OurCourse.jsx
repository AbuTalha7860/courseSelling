import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../utils/utils';

const OurCourse = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin')) || {};
    const token = admin?.token || null;

    const fetchCourses = async () => {
        console.log('OurCourse component mounted');
        try {
            const response = await axios.get('http://localhost:3100/api/courses/', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            console.log('API Response:', response.data);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await axios.delete(`${BACKEND_URL}/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            console.log('Delete Response:', response.data);
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-800">Our Courses</h2>
                    <Link
                        to="/admin/dashboard"
                        className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Back to Dashboard
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="bg-white border rounded-lg shadow-md overflow-hidden"
                        >
                            <img
                                src={course.image?.url || '/imgPL.webp'}
                                alt={course.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{course.description}</p>
                                <p className="text-lg font-medium text-gray-800 mb-4">
                                    ${course.price}
                                </p>
                                <div className="flex justify-between">
                                    <Link
                                        to={`/admin/update-course/${course._id}`}
                                        className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course._id)}
                                        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OurCourse;