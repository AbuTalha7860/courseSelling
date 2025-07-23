import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/utils';

const CourseCreate = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin')) || {};
    const token = admin?.token || null;

    const changePhotoHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImagePreview(reader.result);
                setImage(file);
            };
            reader.onerror = () => {
                toast.error('Error reading image file');
            };
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', { title, description, price, image });

        if (!title || !description || !price) {
            toast.error('Please fill all required fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        if (image) formData.append('image', image);

        try {
            const response = await axios.post(
                `${BACKEND_URL}/courses/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );
            console.log('API Response:', response.data);
            toast.success(response.data.message || 'Course created successfully');
            navigate('/admin/our-courses');
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error(error.response?.data?.errors || 'Error creating course');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
            <div className="max-w-4xl w-full mx-auto p-6 bg-white border rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-8 text-gray-800">Create Course</h3>
                <form onSubmit={handleCreateCourse} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            placeholder="Enter your course title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-700">Description</label>
                        <textarea
                            placeholder="Enter your course description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            placeholder="Enter your course price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-700">Course Image (optional)</label>
                        <div className="flex items-center justify-center">
                            <img
                                src={imagePreview || '/imgPL.webp'}
                                alt="Course Preview"
                                className="w-full max-w-sm h-auto rounded-md object-cover"
                            />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={changePhotoHandler}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-semibold"
                    >
                        Create Course
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CourseCreate;