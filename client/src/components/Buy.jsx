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

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = user?.token || null;

  const stripe = useStripe();
  const elements = useElements();
  const cardElementRef = useRef(null);
  const isMounted = useRef(true);
  const paymentInProgress = useRef(false);

  useEffect(() => {
    if (!token || !user?.existingUser?._id) {
      toast.error('Please log in to purchase the course.');
      navigate('/login');
    }
  }, [token, navigate, user?.existingUser?._id]);

  useEffect(() => {
    let isActive = true;
    const fetchBuyCourseData = async () => {
      console.log('Fetching buy course data for courseId:', courseId);
      try {
        setLoading(true);
        const response = await axios.post(
          `${BACKEND_URL}/courses/buy/${courseId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        console.log('API Response:', response.data);
        if (isActive && response.data.course) {
          setCourse(response.data.course);
          setClientSecret(response.data.clientSecret || ''); // Handle null clientSecret
        } else if (isActive) {
          throw new Error('Invalid response structure');
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (isActive && error?.response?.status === 400) {
          setError('You have already purchased this course');
          navigate('/purchases');
        } else if (isActive) {
          setError(error?.response?.data?.errors || 'An error occurred');
          console.error('Error fetching buy course data:', error.response ? error.response.data : error.message);
        }
      }
    };
    if (token && user?.existingUser?._id) {
      fetchBuyCourseData();
    } else {
      console.log('User not authenticated or no user ID');
      if (isActive) {
        setError('Please log in to purchase the course.');
        navigate('/login');
      }
    }
    return () => {
      isActive = false;
    };
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
      if (!isMounted.current) {
        console.log('Component is unmounted');
        return;
      }

      if (!stripe || !elements) {
        console.log('Stripe or Elements not found');
        toast.error('Stripe is not loaded. Please try again.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement || cardElement._destroyed) {
        console.log('CardElement not found or destroyed');
        toast.error('Card details are not loaded. Please refresh the page.');
        return;
      }

      if (!clientSecret) {
        console.log('No client secret found');
        toast.error('Payment intent not available. Please refresh the page.');
        return;
      }

      if (paymentInProgress.current) {
        console.log('Payment already in progress');
        return;
      }
      paymentInProgress.current = true;

      try {
        const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        console.log('[PaymentMethod Created]:', paymentMethod);

        if (paymentMethodError) {
          console.log('Stripe PaymentMethod Error:', paymentMethodError);
          setCardError(paymentMethodError.message);
          paymentInProgress.current = false;
          return;
        }

        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });
        console.log('Confirmed Payment Intent Response:', { paymentIntent, confirmError });

        if (confirmError) {
          console.log('Confirm Error Details:', confirmError);
          setCardError(confirmError.message || 'Payment confirmation failed');
          paymentInProgress.current = false;
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          console.log('Confirmed Payment Intent:', paymentIntent);
          const paymentInfo = {
            email: user?.existingUser?.email || '',
            userId: user?.existingUser?._id || '',
            courseId,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status,
          };
          console.log('Payment info:', paymentInfo);

          await axios
            .post(
              '/api/order',
              paymentInfo,
              { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            )
            .then((response) => {
              console.log('Order response:', response.data);
              toast.success('Payment Successful');
              navigate('/purchases');
            })
            .catch((error) => {
              console.error('Order error:', error.response ? error.response.data : error.message);
              toast.error('Error processing order. Please try again.');
            });
        } else {
          setCardError(`Payment failed. Status: ${paymentIntent.status}`);
        }
      } catch (error) {
        console.error('Payment error:', error);
        setCardError(error.message || 'An unexpected error occurred during payment');
        toast.error('Payment failed. Please try again');
      } finally {
        paymentInProgress.current = false;
        setLoading(false);
      }
    },
    [stripe, elements, clientSecret, navigate, token, user?.existingUser, courseId]
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