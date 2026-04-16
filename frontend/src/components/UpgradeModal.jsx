import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiCheck, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UpgradeModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('Basic'); // 'Basic' or 'Pro'

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // 1. Ask backend to create a Razorpay subscription
            const { data } = await axios.post('/api/payment/create-subscription', { plan: selectedPlan });

            if (data.isMock) {
                // Instantly simulate successful payment since we are mocking
                await axios.post('/api/payment/verify', {
                    isMock: true,
                    razorpay_subscription_id: data.subscriptionId,
                    plan: selectedPlan
                });
                toast.success(`Successfully upgraded to ${selectedPlan} Plan (Dev Mode)!`);
                onSuccess();
                return;
            }

            const options = {
                key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: 'ToolRoom Premium',
                description: `${selectedPlan} Plan Subscription`,
                image: '/vite.svg',
                handler: async function (response) {
                    try {
                        // 2. Verify payment on backend
                        await axios.post('/api/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: selectedPlan
                        });

                        toast.success(`Successfully upgraded to ${selectedPlan} Plan!`);
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
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col md:flex-row">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-800 bg-white/80 backdrop-blur-sm p-2 rounded-full transition-colors shadow-sm"
                >
                    <FiX className="h-5 w-5" />
                </button>
                
                {/* Free Plan Column */}
                <div 
                    className={`flex-1 p-8 cursor-pointer transition-all duration-300 ${selectedPlan === 'Free' ? 'bg-gray-50 border-2 border-gray-400' : 'hover:bg-gray-50 border border-transparent border-r-gray-200'}`}
                    onClick={() => setSelectedPlan('Free')}
                >
                    <div className="mb-4">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-200 rounded-full">Free Plan</span>
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 mb-2">
                        ₹0<span className="text-sm text-gray-500 font-medium">/month</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 h-10">Start with the basics. Perfect for testing.</p>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                            <span>List up to <strong>5 tools</strong></span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                            <span>Normal visibility</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                            <span>Basic analytics</span>
                        </div>
                    </div>
                </div>

                {/* Basic Plan Column */}
                <div 
                    className={`flex-1 p-8 cursor-pointer transition-all duration-300 ${selectedPlan === 'Basic' ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border border-transparent border-r-gray-200'}`}
                    onClick={() => setSelectedPlan('Basic')}
                >
                    <div className="mb-4">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 rounded-full">Basic Plan</span>
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 mb-2">
                        ₹49<span className="text-sm text-gray-500 font-medium">/month</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 h-10">Best for small businesses getting started.</p>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>List up to <strong>25 tools</strong></span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>Priority listing in search</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>Basic analytics (views)</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>Priority support</span>
                        </div>
                    </div>
                </div>

                {/* Pro Plan Column */}
                <div 
                    className={`flex-1 p-8 cursor-pointer transition-all duration-300 ${selectedPlan === 'Pro' ? 'bg-indigo-50 border-2 border-indigo-500' : 'hover:bg-gray-50 border border-transparent'}`}
                    onClick={() => setSelectedPlan('Pro')}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">Pro Plan</span>
                        <span className="hidden lg:inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 rounded">Recommended</span>
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 mb-2">
                        ₹99<span className="text-sm text-gray-500 font-medium">/month</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 h-10">Ultimate power for scaling rental operations.</p>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                            <span><strong>Unlimited</strong> tool listings</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                            <span>Highlighted & High Ranking</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                            <span>Full analytics & Data exports</span>
                        </div>
                        <div className="flex items-center text-gray-700 text-sm">
                            <FiCheck className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                            <span>Dedicated account manager</span>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center">
                        <FiShield className="mr-1 inline" /> {selectedPlan === 'Free' ? 'Manage via Dashboard Settings' : 'Secure checkout via Razorpay'}
                    </p>
                    <button
                        onClick={selectedPlan === 'Free' ? onClose : handleUpgrade}
                        disabled={loading}
                        className={`py-3 px-8 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center min-w-[200px] ${selectedPlan === 'Pro' ? 'bg-indigo-600 hover:bg-indigo-700' : selectedPlan === 'Free' ? 'bg-gray-800 hover:bg-black' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : selectedPlan === 'Free' ? 'Close Modal' : `Upgrade to ${selectedPlan}`}
                    </button>
                </div>
                
                {/* Spacer for absolute footer */}
                <div className="h-24 w-full md:hidden"></div>
            </div>
        </div>
    );
};

export default UpgradeModal;
