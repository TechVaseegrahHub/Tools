import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = false, isProcessing = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 ${isDestructive ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    <FiAlertTriangle className={`h-7 w-7 ${isDestructive ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>

                <div className="flex justify-end gap-3 flex-col sm:flex-row">
                    <button
                        onClick={onClose}
                        className="btn-outline flex-1"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`font-semibold flex-1 py-2 px-4 rounded-lg flex justify-center items-center shadow-md transition-all text-white ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
