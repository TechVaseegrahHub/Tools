import React, { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX, FiRotateCw, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back, 'user' = front
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Start camera
    const startCamera = async (mode) => {
        try {
            setIsLoading(true);
            setError(null);

            // Stop existing stream if any
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            // Request camera access
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Unable to access camera. Please check permissions.');
            toast.error('Camera access denied or not available');
            setIsLoading(false);
        }
    };

    // Initialize camera on mount
    useEffect(() => {
        startCamera(facingMode);

        // Cleanup on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Switch camera
    const switchCamera = () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        startCamera(newMode);
    };

    // Capture photo
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedImage(null);
    };

    // Use captured photo
    const usePhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    // Handle close
    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between">
                    <div className="flex items-center text-white">
                        <FiCamera className="h-6 w-6 mr-2" />
                        <h2 className="text-xl font-bold">Capture Tool Image</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Camera View */}
                <div className="relative bg-black">
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-96 text-white">
                            <FiCamera className="h-16 w-16 mb-4 opacity-50" />
                            <p className="text-lg">{error}</p>
                            <button
                                onClick={() => startCamera(facingMode)}
                                className="mt-4 btn-primary flex items-center"
                            >
                                <FiRefreshCw className="mr-2" /> Try Again
                            </button>
                        </div>
                    ) : capturedImage ? (
                        // Show captured image
                        <div className="relative">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                        </div>
                    ) : (
                        // Show live camera feed
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-white text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                                        <p>Starting camera...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hidden canvas for capturing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Controls */}
                <div className="bg-gray-50 p-4">
                    {capturedImage ? (
                        // Captured image controls
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={retakePhoto}
                                className="btn-outline flex items-center px-6 py-3"
                            >
                                <FiRefreshCw className="mr-2" /> Retake
                            </button>
                            <button
                                onClick={usePhoto}
                                className="btn-primary flex items-center px-6 py-3"
                            >
                                <FiCheck className="mr-2" /> Use This Photo
                            </button>
                        </div>
                    ) : (
                        // Camera controls
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    Camera: {facingMode === 'environment' ? 'Back' : 'Front'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={switchCamera}
                                    disabled={isLoading || error}
                                    className="btn-outline flex items-center"
                                    title="Switch Camera"
                                >
                                    <FiRotateCw className="mr-2" /> Switch Camera
                                </button>

                                <button
                                    onClick={capturePhoto}
                                    disabled={isLoading || error}
                                    className="btn-primary flex items-center px-8 py-3 text-lg"
                                >
                                    <FiCamera className="mr-2" /> Capture
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                {!capturedImage && !error && (
                    <div className="bg-blue-50 border-t border-blue-200 p-3">
                        <p className="text-sm text-blue-900 text-center">
                            📱 Position the tool in the frame and click <strong>Capture</strong> to take a photo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
