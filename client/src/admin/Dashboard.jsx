import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";
// import { BACKEND_URL } from "../utils/utils";
function Dashboard() {
  const [stats, setStats] = useState({ courses: 0, users: 0, purchases: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/admin/dashboard-stats`, { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
      navigate("/");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response.data.errors || "Error in logging out");
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div className="fixed md:static inset-y-0 left-0 w-48 sm:w-64 bg-gray-100 p-3 sm:p-5 flex-shrink-0 z-20 transition-transform duration-300 md:translate-x-0">
        <div className="flex items-center flex-col mb-6 sm:mb-10 mt-8 md:mt-0">
          <img src={logo} alt="Profile" className="rounded-full h-16 sm:h-20 w-16 sm:w-20" />
          <h2 className="text-base sm:text-lg font-semibold mt-2 sm:mt-4">I'm Admin</h2>
        </div>
        <nav className="flex flex-col space-y-2 sm:space-y-4">
          <Link to="/admin/our-course">
            <button className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded">
              Our Courses
            </button>
          </Link>
          <Link to="/admin/create-course">
            <button className="w-full bg-orange-500 hover:bg-blue-600 text-white py-2 rounded">
              Create Course
            </button>
          </Link>

          <Link to="/">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded">
              Home
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
          >
            Logout
          </button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen p-2 sm:p-4">
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-6 sm:p-10 md:p-14 flex flex-col items-center max-w-lg w-full border border-gray-200 transition-all duration-300">
          <img src={logo} alt="Admin" className="w-12 sm:w-16 h-12 sm:h-16 rounded-full mb-2 sm:mb-4 shadow" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 text-center">Welcome, Admin!</h1>
          <p className="text-gray-600 text-center mb-3 sm:mb-6 text-sm sm:text-base md:text-lg">You have full control over courses, users, and platform content. Use the sidebar to manage your dashboard efficiently.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-2 w-full">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">🎓</span>
              <span className="text-xs sm:text-sm text-gray-500 mt-1">Manage Courses</span>
              <span className="text-base sm:text-lg font-semibold text-blue-700 mt-1">{loadingStats ? '...' : stats.courses}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">🛠️</span>
              <span className="text-xs sm:text-sm text-gray-500 mt-1">Create Content</span>
              <span className="text-base sm:text-lg font-semibold text-green-700 mt-1">{loadingStats ? '...' : stats.purchases}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500">👥</span>
              <span className="text-xs sm:text-sm text-gray-500 mt-1">View Users</span>
              <span className="text-base sm:text-lg font-semibold text-orange-600 mt-1">{loadingStats ? '...' : stats.users}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
