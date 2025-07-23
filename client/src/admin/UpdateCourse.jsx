import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/utils';
import Modal from 'react-modal';

function UpdateCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminError, setAdminError] = useState(null);
    const [creatorId, setCreatorId] = useState("");
    const [creatorName, setCreatorName] = useState("");
    const [editBlocked, setEditBlocked] = useState(false);
    const admin = JSON.parse(localStorage.getItem("admin") || '{}');
    const adminId = admin?.id || admin?._id || null;

    const navigate = useNavigate();
    const { id } = useParams();

    console.log("UpdateCourse component mounted, ID:", id);

    useEffect(() => {
        let isMounted = true;
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3100/api/courses/${id}`, {
                    withCredentials: true,
                });
                if (isMounted) {
                    console.log("Course data:", data);
                    setTitle(data.title || "");
                    setDescription(data.description || "");
                    setPrice(data.price ? data.price.toString() : "");
                    setImagePreview(data.image?.url || "");
                    setCreatorId(data.creatorId ? data.creatorId.toString() : "");
                    setCreatorName(data.creatorName || "");
                    if (data.creatorId && adminId && data.creatorId.toString() !== adminId.toString()) {
                        setEditBlocked(true);
                    }
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    const backendMsg = error.response?.data?.error || error.response?.data?.errors;
                    if (error.response?.status === 403 && backendMsg && backendMsg.includes('created by another admin')) {
                        setEditBlocked(true);
                        setCreatorId(data?.creatorId ? data.creatorId.toString() : "");
                        setCreatorName(data?.creatorName || "");
                    } else {
                        setError(error.response?.data?.errors || "Failed to fetch course");
                    }
                    setLoading(false);
                    toast.error(error.response?.data?.errors || "Failed to fetch course details");
                }
            }
        };
        fetchCourse();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const changePhotoHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImagePreview(reader.result);
                setImage(file);
                console.log("Image selected:", file.name);
            };
            reader.onerror = () => {
                toast.error("Error reading image file");
            };
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        console.log("Form submitted:", { title, description, price, image });

        if (!title || !description || !price) {
            toast.error("Please fill all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", price);
        if (image) formData.append("image", image);

        const admin = JSON.parse(localStorage.getItem("admin")) || {};
        const token = admin.token;
        console.log("Token being sent:", token);

        if (!token) {
            toast.error("Please log in to update a course");
            navigate("/admin/login");
            return;
        }

        try {
            const response = await axios.put(
                `${BACKEND_URL}/courses/update/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            console.log("API Response:", response.data);
            if (!response.data.course) {
                toast.error(response.data.errors || "Course not found or no changes applied");
                return;
            }
            toast.success(response.data.message || "Course updated successfully");
            console.log("Navigating to /admin/our-courses");
            navigate("/admin/our-courses");
        } catch (error) {
            console.error("Error updating course:", error);
            const backendMsg = error.response?.data?.error || error.response?.data?.errors;
            if (backendMsg && backendMsg.includes('created by another admin')) {
                setAdminError(backendMsg);
            } else {
                toast.error(backendMsg || "Error updating course");
            }
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl text-red-600 mb-4">Error: {error}</h1>
                    <button
                        onClick={() => navigate("/admin/our-courses")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (editBlocked) {
        return (
            <Modal
                isOpen={true}
                onRequestClose={() => navigate("/admin/our-courses")}
                contentLabel="Edit Blocked"
                ariaHideApp={false}
                style={{
                    overlay: { backgroundColor: 'rgba(30,41,59,0.6)' },
                    content: {
                        width: '350px',
                        height: '200px',
                        margin: 'auto',
                        textAlign: 'center',
                        borderRadius: '16px',
                        padding: '32px',
                        background: '#fff',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }
                }}
            >
                <h2 className="text-xl font-bold text-red-600 mb-4">Permission Denied</h2>
                <p className="mb-6 text-gray-700">You cannot edit this course. It was created by another admin{creatorName ? ` (${creatorName})` : creatorId ? ` (ID: ${creatorId})` : ''}.</p>
                <button
                    onClick={() => navigate("/admin/our-courses")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Courses
                </button>
            </Modal>
        );
    }

    if (adminError) {
        return (
            <Modal
                isOpen={true}
                onRequestClose={() => setAdminError(null)}
                contentLabel="Admin Error"
                ariaHideApp={false}
                style={{
                    overlay: { backgroundColor: 'rgba(30,41,59,0.6)' },
                    content: {
                        maxWidth: '350px',
                        margin: 'auto',
                        textAlign: 'center',
                        borderRadius: '16px',
                        padding: '32px',
                        background: '#fff',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }
                }}
            >
                <h2 className="text-xl font-bold text-red-600 mb-4">Permission Denied</h2>
                <p className="mb-6 text-gray-700">{adminError}</p>
                <button
                    onClick={() => { setAdminError(null); navigate("/admin/our-courses"); }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Courses
                </button>
            </Modal>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
            <div className="max-w-4xl w-full mx-auto p-6 bg-white border rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-8 text-gray-800">Update Course</h3>
                <form onSubmit={handleUpdateCourse} className="space-y-6">
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
                                src={imagePreview || "/imgPL.webp"}
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
                        Update Course
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateCourse;