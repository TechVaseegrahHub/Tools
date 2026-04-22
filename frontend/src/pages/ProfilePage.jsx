import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, 
    FiShield, FiClock, FiSettings, FiEdit2, FiLock,
    FiCheckCircle, FiSmartphone, FiLayout, FiBell,
    FiActivity, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage = () => {
    const { user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Mock data for elements not in the user object
    const profileData = {
        userId: 'BM' + (user?.id?.toString().slice(-4) || '1658'),
        status: 'Active',
        location: 'Tamil Nadu, India',
        phone: user?.whatsappNumber || 'Not provided',
        joiningDate: 'October 12, 2023',
        lastLogin: 'Today, 10:45 AM',
        recentActivity: [
            { id: 1, action: 'Added new tool', item: 'Electric Drill - Pro', time: '2 hours ago', icon: FiActivity },
            { id: 2, action: 'Updated inventory', item: 'Safety Helmets', time: '5 hours ago', icon: FiLayout },
            { id: 3, action: 'User login', item: 'System Login', time: 'Yesterday', icon: FiClock },
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto py-8 px-4 sm:px-6"
        >
            {/* Header Section */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 p-1">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=128`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute bottom-0 right-0 bg-white shadow-md border border-gray-100 p-2 rounded-full text-primary-600 hover:text-primary-700 transition-all hover:scale-110"
                        >
                            <FiEdit2 size={14} />
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-2xl font-black text-black uppercase tracking-tighter">
                                {user?.name || 'Medha Kesavan'}
                            </h1>
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full border border-accent/20">
                                {user?.role || 'Admin'}
                            </span>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                {profileData.status}
                            </span>
                        </div>
                        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4">
                            User ID: {profileData.userId}
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <FiMail className="text-gray-400" />
                                <span>{user?.email || 'medha@example.com'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <FiMapPin className="text-gray-400" />
                                <span>{profileData.location}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="md:self-start px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg hover:shadow-black/20 flex items-center gap-2"
                    >
                        <FiEdit2 size={14} />
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal & Account Info */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Personal Information */}
                    <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <FiUser size={20} />
                            </div>
                            <h2 className="text-sm font-black text-black uppercase tracking-widest">Personal Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Full Name" value={user?.name || 'Medha Kesavan'} icon={FiUser} />
                            <InfoField label="Email Address" value={user?.email || 'medha@example.com'} icon={FiMail} />
                            <InfoField label="Phone Number" value={profileData.phone} icon={FiPhone} />
                            <InfoField label="Location" value={profileData.location} icon={FiMapPin} />
                            <InfoField label="Joining Date" value={profileData.joiningDate} icon={FiCalendar} />
                        </div>
                    </motion.div>

                    {/* Account Details */}
                    <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <FiShield size={20} />
                            </div>
                            <h2 className="text-sm font-black text-black uppercase tracking-widest">Account Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Username" value={(user?.name || 'Medha').toLowerCase().replace(' ', '_')} icon={FiUser} />
                            <InfoField label="Role" value={user?.role || 'Admin'} icon={FiShield} isBadge />
                            <InfoField label="Account Status" value={profileData.status} icon={FiCheckCircle} isBadge badgeColor="green" />
                            <InfoField label="Last Login" value={profileData.lastLogin} icon={FiClock} />
                        </div>
                    </motion.div>

                    {/* Security */}
                    <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                <FiLock size={20} />
                            </div>
                            <h2 className="text-sm font-black text-black uppercase tracking-widest">Security Settings</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400">
                                        <FiLock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black uppercase tracking-tighter">Account Password</p>
                                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-0.5">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-white hover:border-black transition-all">
                                    Change Password
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400">
                                        <FiSmartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black uppercase tracking-tighter">Two-Factor Auth</p>
                                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-0.5">Add extra layer of security</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Preferences & Activity */}
                <div className="space-y-6">
                    
                    {/* Preferences */}
                    <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                <FiSettings size={20} />
                            </div>
                            <h2 className="text-sm font-black text-black uppercase tracking-widest">Preferences</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiLayout className="text-gray-400" />
                                    <span className="text-xs font-bold text-black uppercase tracking-tighter">Dark Mode</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiBell className="text-gray-400" />
                                    <span className="text-xs font-bold text-black uppercase tracking-tighter">Email Alerts</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiSmartphone className="text-gray-400" />
                                    <span className="text-xs font-bold text-black uppercase tracking-tighter">SMS Alerts</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={cardVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FiActivity size={20} />
                            </div>
                            <h2 className="text-sm font-black text-black uppercase tracking-widest">Recent Activity</h2>
                        </div>
                        
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
                            
                            <div className="space-y-6 relative">
                                {profileData.recentActivity.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-6 h-6 rounded-full bg-white border-2 border-primary-500 z-10 flex items-center justify-center transition-transform group-hover:scale-125">
                                            <item.icon className="text-primary-500 w-2.5 h-2.5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-black uppercase tracking-tighter leading-none">{item.action}</p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-1">{item.item}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full mt-6 py-2 text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest border border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                            View Full Timeline
                            <FiChevronRight size={12} />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                user={user}
            />
        </motion.div>
    );
};

const InfoField = ({ label, value, icon: Icon, isBadge, badgeColor }) => (
    <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 group hover:border-primary-100 hover:bg-white transition-all">
            <Icon className="text-gray-400 group-hover:text-primary-500 transition-colors" size={16} />
            {isBadge ? (
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    badgeColor === 'green' 
                        ? 'bg-green-50 text-green-600 border border-green-100' 
                        : 'bg-accent/10 text-accent border border-accent/20'
                }`}>
                    {value}
                </span>
            ) : (
                <span className="text-sm font-bold text-black uppercase tracking-tighter">{value}</span>
            )}
        </div>
    </div>
);

export default ProfilePage;
