import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiCheck, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UpgradeModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // 1. Ask backend to create a Razorpay subscription
            const { data } = await axios.post('/api/payment/create-subscription');

            const options = {
                key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: 'ToolRoom Premium',
                description: 'Unlimited Tools Subscription',
                image: '/vite.svg',
                handler: async function (response) {
                    try {
                        // 2. Verify payment on backend
                        await axios.post('/api/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.success('Successfully upgraded to Premium!');
                        onSuccess(); // Callback to refresh UI/tools state
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        toast.error(err.response?.data?.message || 'Payment verification failed.');
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                theme: {
                    color: '#3b82f6', // Your brand color
                },
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
            });

            razorpayInstance.open();
        } catch (err) {
            console.error('Failed to initiate subscription:', err);
            toast.error(err.response?.data?.message || 'Failed to initialize payment gateway.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                {/* Header Graphic */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <FiShield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Tool Limit Reached</h2>
                    <p className="text-blue-100 text-sm">You have reached the free tier limit of 10 tools.</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-4xl font-extrabold text-gray-900 mb-2">
                            ₹99<span className="text-lg text-gray-500 font-medium">/month</span>
                        </div>
                        <p className="text-gray-600">Upgrade to Premium to unlock unlimited tools and grow your inventory without restrictions.</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center text-gray-700">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <FiCheck className="h-3 w-3 text-green-600" />
                            </div>
                            <span>Unlimited tool creation</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <FiCheck className="h-3 w-3 text-green-600" />
                            </div>
                            <span>Priority support</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <FiCheck className="h-3 w-3 text-green-600" />
                            </div>
                            <span>Cancel anytime</span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Upgrade Now'}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                        <FiShield className="mr-1" /> Secure checkout via Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
