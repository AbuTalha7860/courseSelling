import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaDiscourse, FaDownload } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { IoLogIn, IoLogOut } from 'react-icons/io5';
import { RiHome2Fill } from 'react-icons/ri';
import { HiMenu, HiX } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/utils';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = user?.token || null;

  console.log('User object:', user);
  console.log('Token:', token);
  console.log('Purchases:', purchases);

  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false);
      setErrorMessage('Please log in to view your purchases.');
      navigate('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/purchases', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('Purchases API response:', response.data);
        const courseData = response.data.purchasedCourses || [];
        if (!Array.isArray(courseData)) {
          console.error('Expected purchasedCourses to be an array, got:', courseData);
          throw new Error('Invalid purchase data format');
        }
        setPurchases(courseData);
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching purchases:', error);
        const errorMsg =
          error.response?.data?.message ||
          (typeof error.response?.data === 'string' && error.response.data.includes('<!doctype html>')
            ? 'Failed to reach backend server. Check if backend is running on port 3100.'
            : 'Failed to fetch purchase data');
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPurchases();
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message || 'Logged out successfully');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      const errorMsg = error.response?.data?.message || 'Failed to log out';
      toast.error(errorMsg);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`fixed inset-y-0 left-0 bg-gray-100 p-5 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 z-50`}
      >
        <nav>
          <ul className="mt-16 md:mt-0">
            <li className="mb-4">
              <Link to="/" className="flex items-center">
                <RiHome2Fill className="mr-2" /> Home
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/courses" className="flex items-center">
                <FaDiscourse className="mr-2" /> Courses
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/purchases" className="flex items-center text-blue-500">
                <FaDownload className="mr-2" /> Purchases
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/settings" className="flex items-center">
                <IoMdSettings className="mr-2" /> Settings
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex items-center">
                  <IoLogOut className="mr-2" /> Logout
                </button>
              ) : (
                <Link to="/login" className="flex items-center">
                  <IoLogIn className="mr-2" /> Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>

      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
      </button>

      <div
        className={`flex-1 p-8 bg-gray-50 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } md:ml-64`}
      >
        <h2 className="text-xl font-semibold mt-6 md:mt-0 mb-6">My Purchases</h2>

        {errorMessage && (
          <div className="text-red-500 text-center mb-4">
            {errorMessage}
            <button
              onClick={() => fetchPurchases()}
              className="ml-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-center flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading purchases...
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {purchases.map((purchase, index) => (
              <div key={purchase._id || index} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col items-center space-y-4">
                  <img
                    className="rounded-lg w-full h-48 object-cover"
                    src={purchase.image?.url || 'https://placehold.co/200'}
                    alt={purchase.title || 'Course image'}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200';
                    }}
                  />
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{purchase.title || 'Untitled Course'}</h3>
                    <p className="text-gray-500">
                      {purchase.description && purchase.description.length > 100
                        ? `${purchase.description.slice(0, 100)}...`
                        : purchase.description || 'No description available'}
                    </p>
                    <span className="text-green-700 font-semibold text-sm">
                      ${purchase.price?.toFixed(2) || 'N/A'} only
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">You have no purchases yet.</p>
            <Link
              to="/courses"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Purchases;