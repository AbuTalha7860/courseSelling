import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { BACKEND_URL } from '../utils/utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [cardError, setCardError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user?.token || null; // Fallback to localStorage token

  const stripe = useStripe();
  const elements = useElements();
  const cardElementRef = useRef(null);
  const isMounted = useRef(true);
  const paymentInProgress = useRef(false);

  useEffect(() => {
    if (!token && !document.cookie.includes('jwt')) {
      toast.error('Please log in to purchase the course.');
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchBuyCourseData = async (courseId) => {
    try {
      console.log(`Fetching buy course data for courseId: ${courseId}`);
      const token = user?.token || (document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]);
      if (!token) {
        toast.error('Please log in to continue');
        window.location.href = '/login';
        return;
      }
      const response = await axios.post(`${BACKEND_URL}/buy/${courseId}`, {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Buy course data fetched successfully', response.data);
      setCourse(response.data.course);
      setClientSecret(response.data.clientSecret);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy course data:', error.response?.data || error.message);
      if (error.response?.data?.errors === 'Invalid authorization or expired token') {
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.errors || 'Failed to fetch buy course data');
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBuyCourseData(courseId);
        setCourse(data.course);
        setClientSecret(data.clientSecret);
      } catch (error) {
        setError('Failed to load course data');
      }
    };
    if ((token || document.cookie.includes('jwt')) && user?.existingUser?._id) {
      fetchData();
    } else {
      setError('Please log in to purchase the course.');
      navigate('/login');
    }
  }, [courseId, navigate, token, user?.existingUser?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stripe && elements) setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [stripe, elements]);

  const handlePurchase = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isMounted.current || !stripe || !elements || paymentInProgress.current) return;

      paymentInProgress.current = true;
      try {
        const cardElement = elements.getElement(CardElement);
        const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        if (paymentMethodError) {
          setCardError(paymentMethodError.message);
          paymentInProgress.current = false;
          return;
        }

        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });
        if (confirmError) {
          setCardError(confirmError.message);
          paymentInProgress.current = false;
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          const paymentInfo = {
            paymentId: paymentIntent.id,
            courseId,
            amount: paymentIntent.amount / 100,
            status: paymentIntent.status,
          };
          const confirmResponse = await axios.post(
            `${BACKEND_URL}/confirm`,
            paymentInfo,
            { headers: { Authorization: `Bearer ${token || document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]}` }, withCredentials: true }
          );
          toast.success('Payment Successful');
          navigate('/purchases');
        } else {
          setCardError(`Payment failed. Status: ${paymentIntent.status}`);
        }
      } catch (error) {
        setCardError(error.message || 'Payment failed');
        toast.error('Payment failed. Please try again');
      } finally {
        paymentInProgress.current = false;
        setLoading(false);
      }
    },
    [stripe, elements, clientSecret, navigate, token, courseId, user?.existingUser?._id]
  );

  const handleOtherPaymentMethod = () => {
    toast.info('Other payment methods are not implemented yet.');
  };

  return (
    <>
      {error ? (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md w-full">
            <p className="text-lg font-semibold text-center">{error}</p>
            <button
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition duration-200 mt-4 flex items-center justify-center"
              onClick={() => navigate('/purchases')}
            >
              View Purchases
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-center items-start min-h-screen bg-gray-100 p-4">
          {loading || !course ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <form onSubmit={handlePurchase} className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Order Details</h1>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-600">Total Price:</h2>
                    <p className="text-red-500 font-bold">${course.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-600">Course Name:</h2>
                    <p className="text-red-500 font-bold">{course.title}</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">Payment</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit/Debit Card</label>
                    <CardElement
                      ref={cardElementRef}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                          },
                          invalid: { color: '#9e2146' },
                        },
                      }}
                    />
                    {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !stripe || !elements || paymentInProgress.current}
                    className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition duration-200 mb-3 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button
                    onClick={handleOtherPaymentMethod}
                    disabled={loading || paymentInProgress.current}
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center disabled:bg-gray-400"
                  >
                    <span className="mr-2">🅿️</span> Other Payment Method
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default Buy;