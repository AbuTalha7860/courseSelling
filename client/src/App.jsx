import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Singup';
import toast, { Toaster } from 'react-hot-toast';
import Buy from './components/Buy';
import Courses from './components/Courses';
import Purchases from './components/Purchases';
import ErrorBoundary from './components/ErrorBoundary';
import Settings from './components/Settings';

import AdminSignup from './admin/AdminSignup';
import AdminLogin from './admin/AdminLogin';
import UpdateCourse from './admin/UpdateCourse';
import CourseCreate from './admin/CourseCreate';
import OurCourse from './admin/OurCourse';
import Dashboard from './admin/Dashboard';

const App = () => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    const user = JSON.parse(localStorage.getItem("user"));
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path='/signup' element={<Signup />} />

                <Route path='/buy/:courseId' element={
                    <ErrorBoundary>
                        <Buy />
                    </ErrorBoundary>
                } />

                <Route path='/courses' element={<Courses />} />
                <Route path='/purchases' element={user ? <Purchases /> : <Navigate to={"/login"} />} />
                <Route path='/settings' element={user ? <Settings /> : <Navigate to={"/login"} />} />

                {/* Admin Routes */}
                <Route path='/admin/signup' element={<AdminSignup />} />
                <Route path='/admin/login' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={admin ? <Dashboard /> : <Navigate to={"/admin/login"} />} />
                <Route path='/admin/create-course' element={<CourseCreate />} />
                <Route path='/admin/update-course/:id' element={<UpdateCourse />} />
                <Route path='/admin/our-courses' element={<OurCourse />} />
                <Route path='/admin/our-course' element={<Navigate to="/admin/our-courses" />} /> {/* ✅ Fallback redirect */}
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;