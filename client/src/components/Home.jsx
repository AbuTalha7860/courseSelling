import React, { useEffect, useState } from 'react';
import logo from '../../public/logo.webp';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/utils';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useState(() => {
    const token = localStorage.getItem('user')
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [])
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
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
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/courses/`, {
          withCredentials: true
        });
        console.log("Courses fetched successfully", response.data);
        setCourses(response.data);
      } catch (error) {
        console.log("Error fetching courses", error);
      }
    };
    fetchCourses();
  }, []);

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className='bg-gradient-to-r from-black to-blue-950 min-h-screen flex flex-col'>
      <div className='text-white container mx-auto w-full px-20 flex flex-col flex-1'>
        {/* Header part */}
        <header className='flex items-center justify-between p-6'>
          <div className='flex items-center space-x-2'>
            <img src={logo} className='w-10 h-10 rounded-full' alt="" />
            <h1 className='text-2xl font-bold text-orange-500 '>CourseHaven</h1>
          </div>
          <div className='space-x-4'>
            {isLoggedIn ? (
              <>
                <button onClick={handleLogout} className='bg-transparent text-white py-2 px-4 border border-white rounded'>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={'/login'} className='bg-transparent text-white py-2 px-4 border border-white rounded'>
                  Login
                </Link>
                <Link to={'/signup'} className='bg-transparent text-white py-2 px-4 border border-white rounded'>
                  Signup
                </Link>
              </>
            )}
          </div>

        </header>

        {/* Main section */}
        <section className='text-center py-20 flex-1'>
          <h2 className='text-4xl font-bold text-orange-500'>Welcome to CourseHaven</h2>
          <br />
          <p className='text-gray-400 text-lg leading-relaxed'>
            Discover and purchase high-quality courses from various educational institutions around the world.
            Sharpen your skills with courses crafted by experts.
          </p>
          <div className='space-x-4 mt-8'>
            <Link to={"/courses"} className='bg-green-500 text-white rounded px-6 py-3 font-semibold hover:bg-white duration-300 hover:text-black '>
              Explore Courses
            </Link>
            <Link to={"https://www.youtube.com/@LearnCodingOfficial/playlists"} className='bg-white text-black rounded px-6 py-3 font-semibold hover:bg-green-500 duration-300 hover:text-white '>
              Courses Video
            </Link>
          </div>
        </section>
        <section className='flex-1'>
          <Slider {...settings} className="space-x-4">
            {courses.map((course) => (
              <div key={course._id} className="px-2">
                <div className="p-4 bg-gray-900 rounded-lg overflow-hidden shadow-md">
                  <div className="relative flex-shrink-0 w-92 transition-transform duration-300 transform hover:scale-105">
                    <img
                      src={course.image?.url || "https://picsum.photos/150"}
                      alt={course.title}
                      className="w-full h-32 object-contain"
                    />
                    <div className="mt-4 text-center">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <button className='mt-4 bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-blue-500 duration-300'>Enroll Now</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        <hr />
        {/* Footer part */}
        <footer className='my-8'>
          <div className='grid grid-cols-1 md:grid-cols-3'>
            <div className='flex flex-col items-center md:items-start'>
              <div className='flex items-center space-x-2'>
                <img src={logo} className='w-10 h-10 rounded-full' alt="" />
                <h1 className='text-2xl font-bold text-orange-500'>CourseHaven</h1>
              </div>
              <div className='mt-3 ml-2 md:ml-8'>
                <p className='mb-2'>Follow Us</p>
                <div className='flex space-x-4'>
                  <a href=""><FaFacebook className='text-2xl hover:text-blue-400 duration-300' /></a>
                  <a href=""><FaInstagram className='text-2xl hover:text-pink-600 duration-300' /></a>
                  <a href=""><FaTwitter className='text-2xl hover:text-blue-600 duration-300' /></a>
                </div>
              </div>
            </div>
            <div className='items-center flex flex-col'>
              <h3 className='text-lg font-semibold mb-4'>connects</h3>
              <ul className='space-y-2 text-gray-400'>
                <li className='hover:text-white cursor-pointer duration-300'>youtube-learn coding</li>
                <li className='hover:text-white cursor-pointer duration-300'>telegrom-learn coding</li>
                <li className='hover:text-white cursor-pointer duration-300'>Github-learn coding</li>
              </ul>
            </div>
            <div className='items-center flex flex-col'>
              <h3 className='text-lg font-semibold mb-4'>copyright &#169; </h3>
              <ul className='space-y-2 text-gray-400'>
                <li className='hover:text-white cursor-pointer duration-300'> Term & Condition </li>
                <li className='hover:text-white cursor-pointer duration-300'> Privacy Policy </li>
                <li className='hover:text-white cursor-pointer duration-300'> Refund & Cancellation </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
