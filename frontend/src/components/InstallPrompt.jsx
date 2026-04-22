import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const location = useLocation();

    // 1. Initial detection and event listeners
    useEffect(() => {
        // Detect if the app is already in standalone mode
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        setIsStandalone(standalone);

        // Detect if it's an iOS device
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(ios);

        // Listen for the native install prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('PWA: beforeinstallprompt event captured');
        };

        // Listen for successful installation (from any source)
        const handleAppInstalled = () => {
            console.log('PWA: App installed successfully');
            localStorage.setItem('appInstalled', 'true');
            setIsVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // 2. Control visibility based on route and session logic
    useEffect(() => {
        const isLoginPage = location.pathname === '/login';
        const appInstalled = localStorage.getItem('appInstalled') === 'true';
        const installPopupDismissed = sessionStorage.getItem('installPopupDismissed') === 'true';

        // Conditions to show:
        // - Must be on login page
        // - Must NOT be already installed (standalone or localStorage flag)
        // - Must NOT be dismissed in this session
        // - Must have a prompt available OR be iOS
        const shouldShow = isLoginPage && 
                          !isStandalone && 
                          !appInstalled && 
                          !installPopupDismissed && 
                          (deferredPrompt || isIOS);

        if (shouldShow) {
            // Show with a slight delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [location.pathname, deferredPrompt, isStandalone, isIOS]);

    const handleInstallClick = async () => {
        if (isIOS) return;
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            localStorage.setItem('appInstalled', 'true');
        }

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        sessionStorage.setItem('installPopupDismissed', 'true');
        setIsVisible(false);
    };

    // Final guard for rendering
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md w-full pointer-events-none flex justify-center">
            <div className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-forwards">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

                <div className="relative flex items-start gap-4">
                    {/* App Icon Area */}
                    <div className="flex-shrink-0 relative group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md overflow-hidden transition-transform group-hover:scale-105 duration-300 border border-gray-100">
                            <img src="/icons/icon-192-v2.png" alt="Tools App Icon" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-bold text-gray-950 truncate tracking-tight">Tools App</h3>
                                <p className="text-sm text-gray-500 mt-0.5 leading-snug">Install for a seamless experience</p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                aria-label="Close"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions Area */}
                        <div className="mt-4">
                            {isIOS ? (
                                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/50">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span>Tap</span>
                                        <div className="px-2 py-1 mx-1.5 bg-white rounded shadow-sm flex items-center justify-center border border-gray-100">
                                            <FiShare className="text-blue-600 w-4 h-4" />
                                        </div>
                                        <span>and select <strong className="font-semibold text-gray-900">Add to Home Screen</strong></span>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="mt-3 w-full py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        Got it
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInstallClick}
                                        className="flex-1 py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        Install Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
