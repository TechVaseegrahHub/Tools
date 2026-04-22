import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

const EditProfileModal = ({ isOpen, onClose, user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.whatsappNumber || '',
        location: 'Tamil Nadu, India'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Profile updated successfully!');
            onClose();
        }, 1000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-black uppercase tracking-tighter">Edit User Profile</h2>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Edit */}
                            <div className="flex justify-center mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 p-1">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=random&size=128`} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiCamera size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <InputField 
                                    label="Full Name" 
                                    icon={FiUser} 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                                <InputField 
                                    label="Email Address" 
                                    icon={FiMail} 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    type="email"
                                />
                                <InputField 
                                    label="WhatsApp Number" 
                                    icon={FiPhone} 
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({...formData, phone: val ? `+91${val}` : ''});
                                    }}
                                    placeholder="9876543210"
                                />
                                <InputField 
                                    label="Location" 
                                    icon={FiMapPin} 
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 border-2 border-black text-xs font-black text-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiSave size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const InputField = ({ label, icon: Icon, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Icon size={18} />
            </div>
            <input 
                type={type}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-50 border-2 border-gray-100 py-4 pl-12 pr-4 text-sm font-bold text-black uppercase tracking-tighter rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all"
                placeholder={`Enter your ${label.toLowerCase()}`}
            />
        </div>
    </div>
);

export default EditProfileModal;
