import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
            console.log('beforeinstallprompt event fired');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 flex items-center justify-between space-x-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FiDownload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">Install Aayudha App</h3>
                        <p className="text-xs text-gray-500 mt-0.5 italic">Experience a faster, standalone version</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleInstallClick}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                    >
                        Install
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-all"
                        aria-label="Close"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
