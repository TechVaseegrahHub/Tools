import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 1. Detect if the app is already installed
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        setIsStandalone(standalone);

        // 2. Detect if it's an iOS device
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(ios);

        // 3. Listen for the native install prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e) => {
            console.log('beforeinstallprompt event caught');
            e.preventDefault();
            setDeferredPrompt(e);
            if (!standalone) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 4. For iOS, we show the prompt manually if it's not standalone
        // We add a small delay to make it feel natural
        if (ios && !standalone) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // iOS doesn't support programmatic install, so we just show instructions
            return;
        }

        if (!deferredPrompt) {
            console.log('No deferred prompt available');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FiDownload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">Install Aayudha App</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Faster & works like a real app</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 -mt-1 text-gray-300 hover:text-gray-500 rounded-lg transition-all"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {isIOS ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
                            <span>To install: Tap the </span>
                            <FiShare className="text-blue-600 w-4 h-4 inline" />
                            <span> icon then </span>
                            <span className="font-bold whitespace-nowrap">"Add to Home Screen"</span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            Install Now
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-all active:scale-95"
                        >
                            Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstallPrompt;
